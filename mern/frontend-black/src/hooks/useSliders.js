import { useState, useEffect } from 'react';
import { api } from '../services/realApi';

/**
 * Custom hook to fetch slider data from the backend
 * @returns {Object} - Object containing slider data, loading state, and error state
 */
const useSliders = () => {
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSliders = async () => {
      try {
        setLoading(true);
        const data = await api.admin.getAllSliders();
        setSliders(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching sliders:', err);
        setError('Failed to fetch slider data');
      } finally {
        setLoading(false);
      }
    };

    fetchSliders();
  }, []);

  return { sliders, loading, error };
};

export default useSliders;