import { AppNavigation } from "@/widgets/app-navigation/ui/app-navigation";

export default function MainLayout({ children }: LayoutProps<"/">) {
  return <main className="jobtop-app">{children}<AppNavigation /></main>;
}
