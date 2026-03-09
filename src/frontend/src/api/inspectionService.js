import api from './axios';

/**
 * Service for Inspector-specific sampling module.
 * Targets the /api/inspection/samplings endpoint.
 */
export const inspectionService = {
  /**
   * Get all samplings registered by inspectors.
   * @param {string} status - Optional status filter (PENDING_REVIEW, PENDING_SUBMISSION, SUBMITTED)
   */
  getAllSamplings: async (status = null) => {
    const params = status ? { status_filter: status } : {};
    const response = await api.get('inspection/samplings/', { params });
    return response.data;
  },

  /**
   * Get a single sampling by ID.
   */
  getSampling: async (id) => {
    const response = await api.get(`inspection/samplings/${id}`);
    return response.data;
  },

  /**
   * Create a new sampling record.
   */
  createSampling: async (samplingData) => {
    const response = await api.post('inspection/samplings/', samplingData);
    return response.data;
  },

  /**
   * Review a sampling record.
   */
  reviewSampling: async (id) => {
    const response = await api.patch(`inspection/samplings/${id}/review`);
    return response.data;
  },

  /**
   * Review a batch of samplings.
   */
  reviewBatch: async (batchId) => {
    const response = await api.patch(`inspection/samplings/batch/${batchId}/review`);
    return response.data;
  },

  /**
   * Batch submit multiple samplings.
   */
  batchSubmit: async (ids) => {
    const response = await api.post('inspection/samplings/batch-submit', { sampling_ids: ids });
    return response.data;
  }
};
