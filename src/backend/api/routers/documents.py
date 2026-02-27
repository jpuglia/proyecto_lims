import os
import shutil
import uuid
from typing import List
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from src.backend.api.dependencies import get_db
from src.backend.api.security import get_current_user, require_role
from src.backend.models.auth import Usuario
from src.backend.models.documents import Documento
from src.backend.api.schemas.documents import DocumentoResponse

router = APIRouter()

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload", response_model=DocumentoResponse, status_code=status.HTTP_201_CREATED)
async def upload_documento(
    file: UploadFile = File(...),
    entidad_tipo: str = Form(...),
    entidad_id: int = Form(...),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Sube un archivo y lo asocia a una entidad."""
    
    # Validaciones básicas
    if not file.filename:
        raise HTTPException(status_code=400, detail="Archivo sin nombre.")

    # Generar ruta única
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    # Guardar archivo en disco
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al guardar el archivo: {str(e)}")
    
    # Obtener tamaño
    file_size = os.path.getsize(file_path)

    # Crear registro en BD
    nuevo_doc = Documento(
        nombre=file.filename,
        tipo_mime=file.content_type or "application/octet-stream",
        tamano_bytes=file_size,
        ruta_archivo=file_path,
        entidad_tipo=entidad_tipo,
        entidad_id=entidad_id,
        usuario_id=current_user.usuario_id,
    )
    db.add(nuevo_doc)
    db.commit()
    db.refresh(nuevo_doc)

    return nuevo_doc


@router.get("/{entidad_tipo}/{entidad_id}", response_model=List[DocumentoResponse])
def get_documentos_by_entidad(
    entidad_tipo: str,
    entidad_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Devuelve los documentos asociados a una entidad."""
    docs = db.query(Documento).filter(
        Documento.entidad_tipo == entidad_tipo,
        Documento.entidad_id == entidad_id
    ).all()
    return docs


@router.get("/descargar/{documento_id}")
def descargar_documento(
    documento_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Permite descargar un archivo subido."""
    doc = db.query(Documento).filter(Documento.documento_id == documento_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Documento no encontrado")

    if not os.path.exists(doc.ruta_archivo):
        raise HTTPException(status_code=404, detail="El archivo físico no existe en el servidor")

    return FileResponse(
        path=doc.ruta_archivo,
        filename=doc.nombre,
        media_type=doc.tipo_mime
    )


@router.delete("/{documento_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_documento(
    documento_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_role(["administrador"])),
):
    """Elimina un documento de la base de datos y su archivo físico."""
    doc = db.query(Documento).filter(Documento.documento_id == documento_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Documento no encontrado")

    # Borrar archivo físico si existe
    if os.path.exists(doc.ruta_archivo):
        try:
            os.remove(doc.ruta_archivo)
        except OSError:
            pass # Solo logear en un caso real, por ahora continuamos

    # Borrar de BD
    db.delete(doc)
    db.commit()
    return None
