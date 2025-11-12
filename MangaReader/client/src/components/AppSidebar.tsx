import { Home, BookOpen, Languages, Heart, List, Settings, Upload } from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const mainItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Library", url: "/library", icon: BookOpen },
  { title: "Translator", url: "/translator", icon: Languages },
];

const collectionItems = [
  { title: "Favorites", url: "/favorites", icon: Heart },
  { title: "Playlists", url: "/playlists", icon: List },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar data-testid="sidebar-main">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <span className="font-heading text-lg font-bold">MF</span>
          </div>
          <div>
            <h2 className="font-heading text-base font-bold leading-tight">MangaForge</h2>
            <p className="text-xs text-muted-foreground font-japanese">鍛造</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`nav-${item.title.toLowerCase()}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="my-2" />

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider">
            Collections
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {collectionItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`nav-${item.title.toLowerCase()}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <Link href="/settings">
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            data-testid="button-settings"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </Link>
        
        <Link href="/upload">
          <Button
            className="w-full justify-start gap-2 mt-2"
            data-testid="button-upload"
          >
            <Upload className="h-4 w-4" />
            Upload Manga
          </Button>
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}
