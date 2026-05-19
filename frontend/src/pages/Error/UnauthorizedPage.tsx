import { ShieldAlert } from 'lucide-react';
import { Button } from '@components/ui/Button';
import { useDocumentTitle } from '@hooks/useDocumentTitle';
import { useNavigate } from 'react-router-dom';

const UnauthorizedPage = () => {
  useDocumentTitle('Access Denied');
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[hsl(var(--bg-default))] p-4 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--danger-bg))] text-[hsl(var(--danger))] ring-8 ring-[hsl(var(--danger-bg))/0.5]">
        <ShieldAlert className="h-8 w-8" />
      </div>
      
      <h1 className="type-h2 mb-2 text-[hsl(var(--text-primary))]">
        Access Denied
      </h1>
      
      <p className="type-body mb-8 max-w-[400px] text-[hsl(var(--text-secondary))]">
        You do not have the required permissions to view this page. Please contact your workspace administrator if you believe this is an error.
      </p>
      
      <Button variant="primary" onClick={() => navigate('/dashboard')}>
        Return to Dashboard
      </Button>
    </div>
  );
};

export default UnauthorizedPage;
