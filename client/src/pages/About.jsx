import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function About() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-3xl">
      <Card className="shadow-lg border-primary/20">
        <CardContent className="py-8">
          <h1 className="text-3xl font-bold mb-4 text-primary">About PBL Hackathon Platform</h1>
          <p className="mb-4 text-lg text-gray-700">
            <strong>PBL Hackathon</strong> is a comprehensive platform designed to streamline the management, participation, and judging of hackathons. Whether you are an organizer, judge, or participant, our platform offers an intuitive experience tailored to your needs.
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700">
            <li><strong>Organizers</strong> can create and manage hackathons, add topics and prizes, assign judges, and declare winners with ease.</li>
            <li><strong>Participants</strong> can enroll, form teams, submit projects, and track their hackathon journey seamlessly.</li>
            <li><strong>Judges</strong> are assigned to teams and can evaluate submissions efficiently.</li>
          </ul>
          <p className="mb-2 text-gray-700">
            Key features include:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700">
            <li>Persistent tab navigation for organizers</li>
            <li>Pre-filled forms for efficient team management</li>
            <li>Role-based dashboards and smart redirects</li>
            <li>Seamless prize and winner declaration</li>
            <li>Modern, user-friendly interface</li>
          </ul>
          <p className="text-gray-600">
            Built with React and a robust API backend, our mission is to make hackathon management and participation as smooth and enjoyable as possible.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
