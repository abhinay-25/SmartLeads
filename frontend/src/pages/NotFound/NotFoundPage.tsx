import { useNavigate } from 'react-router-dom';
import { Button } from '@components/ui/Button';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex h-full min-h-[60vh] flex-col items-center justify-center text-center px-6">
      <p className="text-[5rem] font-bold leading-none text-[hsl(var(--bg-muted))] select-none">
        404
      </p>
      <h1 className="type-h1 mt-4">Page not found</h1>
      <p className="type-body mt-2 max-w-sm">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="mt-6">
        <Button variant="primary" size="md" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;
