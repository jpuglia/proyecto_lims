import sys


def run_loader(loader_func):

    if len(sys.argv) != 2:
        print(f"Uso: python {sys.argv[0]} <archivo.csv>")
        exit(1)

    loader_func(sys.argv[1])
