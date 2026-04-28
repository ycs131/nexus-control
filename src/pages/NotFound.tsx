import React from 'react';
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Result
      status="404"
      title="404"
      subTitle="The page you visited does not exist."
      extra={
        <Button type="primary" onClick={() => navigate('/')}>
          Back to Dashboard
        </Button>
      }
    />
  );
};

export default NotFound;
