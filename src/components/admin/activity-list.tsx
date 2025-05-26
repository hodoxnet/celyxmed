"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Activity {
  id: number;
  title: string;
  time: string;
}

interface ActivityListProps {
  title: string;
  activities: Activity[];
}

export function ActivityList({ title, activities }: ActivityListProps) {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center">
              <div className="mr-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                {activity.id}
              </div>
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">{activity.title}</p>
                <p className="text-sm text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}