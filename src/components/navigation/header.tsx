"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  Menu,
  User,
  LogOut,
  Settings,
  MapPin,
  MessageCircle,
} from "lucide-react";
import { NotificationCenter } from "@/components/notifications/notification-center";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function Header() {
  const { data: session, status } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Fetch unread message count
  useEffect(() => {
    if (session?.user?.id) {
      fetchUnreadCount();
      // Set up polling for real-time updates
      const interval = setInterval(fetchUnreadCount, 30000); // Check every 30 seconds
      return () => clearInterval(interval);
    }
  }, [session?.user?.id]);

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch("/api/conversations");
      if (response.ok) {
        const data = await response.json();
        const totalUnread =
          data.conversations?.reduce(
            (sum: number, conv: { _count: { messages: number } }) =>
              sum + conv._count.messages,
            0
          ) || 0;
        setUnreadCount(totalUnread);
      }
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  };

  return (
    <header className="bg-background border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <MapPin className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground hidden sm:block">
                Billboard Marketplace
              </span>
              <span className="text-xl font-bold text-foreground sm:hidden">
                BM
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href="/search"
                    className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"
                  >
                    Find Billboards
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              {session?.user?.role === "OWNER" && (
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      href="/dashboard/listings"
                      className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"
                    >
                      My Listings
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )}

              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href="/messages"
                    className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 relative"
                  >
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="h-4 w-4" />
                      <span>Messages</span>
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      )}
                    </div>
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* User Menu / Auth Buttons */}
          <div className="flex items-center space-x-4">
            {status === "loading" ? (
              <div className="h-8 w-8 animate-pulse bg-muted rounded-full"></div>
            ) : session ? (
              <>
                {/* Notification Center */}
                <NotificationCenter />

                {/* Desktop User Menu */}
                <div className="hidden md:block">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="relative h-8 w-8 rounded-full"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={session.user.image || undefined}
                            alt={session.user.name || "User"}
                          />
                          <AvatarFallback>
                            {getInitials(session.user.name || "User")}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-56"
                      align="end"
                      forceMount
                    >
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {session.user.name}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {session.user.email}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground capitalize">
                            {session.user.role?.toLowerCase()}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard" className="cursor-pointer">
                          <User className="mr-2 h-4 w-4" />
                          <span>Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/profile" className="cursor-pointer">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Profile Settings</span>
                        </Link>
                      </DropdownMenuItem>
                      {session.user.role === "ADMIN" && (
                        <DropdownMenuItem asChild>
                          <Link href="/admin" className="cursor-pointer">
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Admin Dashboard</span>
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleSignOut}
                        className="cursor-pointer"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sign Out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden">
                  <Sheet
                    open={isMobileMenuOpen}
                    onOpenChange={setIsMobileMenuOpen}
                  >
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="sm" className="p-2">
                        <Menu className="h-6 w-6" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </SheetTrigger>
                    <SheetContent
                      side="right"
                      className="w-[300px] sm:w-[400px]"
                    >
                      <SheetHeader>
                        <SheetTitle>Navigation Menu</SheetTitle>
                      </SheetHeader>
                      <nav className="flex flex-col space-y-4 mt-6">
                        {/* User Info */}
                        <div className="flex items-center space-x-3 pb-4 border-b">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={session.user.image || undefined}
                              alt={session.user.name || "User"}
                            />
                            <AvatarFallback>
                              {getInitials(session.user.name || "User")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">
                              {session.user.name}
                            </p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {session.user.role?.toLowerCase()}
                            </p>
                          </div>
                        </div>

                        {/* Navigation Links */}
                        <Link
                          href="/search"
                          className="flex items-center space-x-2 text-sm font-medium hover:text-accent-foreground p-2 rounded-md hover:bg-accent transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <span>Find Billboards</span>
                        </Link>

                        {session.user.role === "OWNER" && (
                          <Link
                            href="/dashboard/listings"
                            className="flex items-center space-x-2 text-sm font-medium hover:text-accent-foreground p-2 rounded-md hover:bg-accent transition-colors"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <span>My Listings</span>
                          </Link>
                        )}

                        <Link
                          href="/messages"
                          className="flex items-center space-x-2 text-sm font-medium hover:text-accent-foreground p-2 rounded-md hover:bg-accent transition-colors relative"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <MessageCircle className="h-4 w-4" />
                          <span>Messages</span>
                          {unreadCount > 0 && (
                            <span className="bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center ml-auto">
                              {unreadCount > 99 ? "99+" : unreadCount}
                            </span>
                          )}
                        </Link>

                        <Link
                          href="/dashboard"
                          className="flex items-center space-x-2 text-sm font-medium hover:text-accent-foreground p-2 rounded-md hover:bg-accent transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <User className="h-4 w-4" />
                          <span>Dashboard</span>
                        </Link>

                        <Link
                          href="/profile"
                          className="flex items-center space-x-2 text-sm font-medium hover:text-accent-foreground p-2 rounded-md hover:bg-accent transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Settings className="h-4 w-4" />
                          <span>Profile Settings</span>
                        </Link>

                        {session.user.role === "ADMIN" && (
                          <Link
                            href="/admin"
                            className="flex items-center space-x-2 text-sm font-medium hover:text-accent-foreground p-2 rounded-md hover:bg-accent transition-colors"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <Settings className="h-4 w-4" />
                            <span>Admin Dashboard</span>
                          </Link>
                        )}

                        <Button
                          variant="ghost"
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            handleSignOut();
                          }}
                          className="justify-start p-2 h-auto font-medium"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign Out
                        </Button>
                      </nav>
                    </SheetContent>
                  </Sheet>
                </div>
              </>
            ) : (
              <>
                {/* Desktop Auth Buttons */}
                <div className="hidden md:flex items-center space-x-2">
                  <Button variant="ghost" asChild>
                    <Link href="/auth/login">Sign In</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/auth/register">Get Started</Link>
                  </Button>
                </div>

                {/* Mobile Menu Button for Unauthenticated */}
                <div className="md:hidden">
                  <Sheet
                    open={isMobileMenuOpen}
                    onOpenChange={setIsMobileMenuOpen}
                  >
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="sm" className="p-2">
                        <Menu className="h-6 w-6" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </SheetTrigger>
                    <SheetContent
                      side="right"
                      className="w-[300px] sm:w-[400px]"
                    >
                      <SheetHeader>
                        <SheetTitle>Navigation Menu</SheetTitle>
                      </SheetHeader>
                      <nav className="flex flex-col space-y-4 mt-6">
                        <Link
                          href="/search"
                          className="flex items-center space-x-2 text-sm font-medium hover:text-accent-foreground p-2 rounded-md hover:bg-accent transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <span>Find Billboards</span>
                        </Link>

                        <Link
                          href="/auth/login"
                          className="flex items-center space-x-2 text-sm font-medium hover:text-accent-foreground p-2 rounded-md hover:bg-accent transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <span>Sign In</span>
                        </Link>

                        <Button asChild className="justify-start">
                          <Link
                            href="/auth/register"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            Get Started
                          </Link>
                        </Button>
                      </nav>
                    </SheetContent>
                  </Sheet>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
