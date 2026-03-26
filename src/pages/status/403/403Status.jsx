import { useNavigate } from "react-router-dom";

export default function Status403() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
      <span className="text-6xl font-bold text-muted-foreground">403</span>
      <h1 className="text-2xl font-semibold">Access Denied</h1>
      <p className="text-muted-foreground max-w-sm">
        You don't have permission to view this page. Contact your HR
        administrator to request access.
      </p>
      <button
        onClick={() => navigate(-1)}
        className="mt-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition"
      >
        Go Back
      </button>
    </div>
  );
}
