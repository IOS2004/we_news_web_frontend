import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-bold text-primary mb-2">
            WeNews
          </h1>
          <p className="text-text-secondary">News That Pays</p>
        </div>
        
        <Outlet />
      </div>
    </div>
  );
}
