import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AddMoney: React.FC = () => {
  const navigate = useNavigate();

  // Immediately redirect to guest topup page (skipping redundant first page)
  useEffect(() => {
    navigate('/guest-topup', { replace: true });
  }, [navigate]);

  return null; // No UI needed since we redirect immediately
};

export default AddMoney;
