import React from "react";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  IconAlertTriangle,
  IconArrowLeft,
} from "@tabler/icons-react";

const NotFound = () => {
  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-2xl">
        <Card className="border-2">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full bg-orange-50 dark:bg-orange-950/30">
                <IconAlertTriangle className="h-12 w-12 text-orange-600 dark:text-orange-500"/>
              </div>
            </div>
            <CardTitle className="text-4xl font-bold tracking-tight">
              404
            </CardTitle>
            <CardDescription className="text-lg mt-2">
              Page Not Found
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">
                The page you&apos;re looking for doesn&apos;t exist or has been
                moved.
              </p>
              <p className="text-sm text-muted-foreground">
                Please check the URL or return to the dashboard.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Button asChild variant="outline" size="lg">
                <Link href="/">
                  <IconArrowLeft className="h-5 w-5"/>
                  Go Back
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotFound;
