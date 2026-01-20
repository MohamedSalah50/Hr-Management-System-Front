"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

const Sidebar = ({
  navigation,
  pathname,
}: {
  navigation: { name: string; href: string; icon: React.ElementType }[];
  pathname: string;
}) => (
  <nav className="space-y-2">
    {navigation.map((item) => {
      const Icon = item.icon;
      const isActive = pathname === item.href;
      return (
        <Link key={item.name} href={item.href}>
          <Button
            variant={isActive ? "secondary" : "ghost"}
            className="w-full justify-start"
          >
            <Icon className="ml-2 h-4 w-4" />
            {item.name}
          </Button>
        </Link>
      );
    })}
  </nav>
);
export default Sidebar;
