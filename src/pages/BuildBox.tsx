import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Construction } from "lucide-react";

const BuildBox = () => {
  return (
    <div className="container mx-auto min-h-[60vh] px-4 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <Construction className="mx-auto mb-6 h-20 w-20 text-primary" />
        <h1 className="mb-4 text-4xl font-bold">Build-a-Box Coming Soon!</h1>
        <p className="mb-8 text-lg text-muted-foreground">
          Create your perfect custom snack box by dragging and dropping your favorite treats. 
          This feature is currently under development and will be available soon.
        </p>
        <Card className="border-2 border-dashed">
          <CardContent className="p-12">
            <p className="text-muted-foreground">
              In the meantime, check out our curated selection of snacks or subscribe to our newsletter to be notified when this feature launches.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BuildBox;
