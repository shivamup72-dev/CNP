// src/screens/Demo.jsx
import { Button } from "@/components/ui/button";

const Demo = () => {
  const handleClick = () => {
    alert("Shadcn Button Clicked!");
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <Button onClick={handleClick} variant="default" size="lg">
        Click Me
      </Button>
    </div>
  );
};

export default Demo;
