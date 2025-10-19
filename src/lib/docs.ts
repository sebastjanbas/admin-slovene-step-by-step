import {
  IconChalkboard,
  IconDashboard,
  IconLanguage,
  IconSettings,
  IconUsers,
  IconVideo,
  IconClock,
} from "@tabler/icons-react";

export const SIDEBAR_DATA = {
  user: {
    name: "Admin",
    email: "admin@example.com",
    avatar: "/avatars/admin.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Language Club",
      url: "/language-club",
      icon: IconLanguage,
    },
    {
      title: "Timeblocks",
      url: "/timeblocks",
      icon: IconClock,
    },
    {
      title: "Sessions",
      url: "/sessions",
      icon: IconChalkboard,
    },
    {
      title: "Courses",
      url: "/courses",
      icon: IconVideo,
    },
    {
      title: "Team",
      url: "/team",
      icon: IconUsers,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/settings",
      icon: IconSettings,
    },
  ],
};
