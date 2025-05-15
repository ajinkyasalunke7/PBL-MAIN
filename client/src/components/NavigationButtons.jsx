import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function NavigationButtons() {
  const navigate = useNavigate();

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        onClick={() => navigate(-1)}
        className="flex items-center gap-1"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>
      <Button
        variant="outline"
        onClick={() => navigate(1)}
        className="flex items-center gap-1"
      >
        Forward
        <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
