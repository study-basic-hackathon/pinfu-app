"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

export function MainNavigation() {
  const pathname = usePathname();
  const { user, signOut } = useAuthenticator((context) => [context.user]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center px-4">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">
              平和アプリ
            </span>
          </Link>
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>スコア</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                    <li className="row-span-3">
                      <NavigationMenuLink asChild>
                        <Link
                          className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                          href="/score"
                        >
                          <div className="mb-2 mt-4 text-lg font-medium">
                            スコア管理
                          </div>
                          <p className="text-sm leading-tight text-muted-foreground">
                            麻雀のゲームスコアを記録・管理できます
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <ListItem href="/score/create" title="新しいスコアを記録">
                      新しいゲームのスコアを入力して記録します
                    </ListItem>
                    <ListItem href="/score" title="スコア履歴">
                      過去のゲーム履歴とスコアを確認できます
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/chat" legacyBehavior passHref>
                  <NavigationMenuLink
                    className={cn(
                      navigationMenuTriggerStyle(),
                      pathname?.startsWith("/chat") && "bg-accent text-accent-foreground"
                    )}
                  >
                    チャット
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/player" legacyBehavior passHref>
                  <NavigationMenuLink
                    className={cn(
                      navigationMenuTriggerStyle(),
                      pathname?.startsWith("/player") && "bg-accent text-accent-foreground"
                    )}
                  >
                    プレイヤー
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* モバイル用のシンプルなナビゲーション */}
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <Link href="/" className="flex items-center space-x-2 md:hidden">
              <span className="font-bold">平和アプリ</span>
            </Link>
          </div>
          <nav className="flex items-center space-x-2">
            {user && (
              <Button onClick={signOut} variant="outline" size="sm">
                ログアウト
              </Button>
            )}
          </nav>
        </div>
      </div>

      {/* モバイル用のメニュー */}
      <div className="border-t md:hidden">
        <div className="container mx-auto px-4 py-2">
          <nav className="flex justify-around">
            <Link
              href="/score"
              className={cn(
                "flex flex-col items-center space-y-1 text-xs",
                pathname?.startsWith("/score") ? "text-primary" : "text-muted-foreground"
              )}
            >
              <span>スコア</span>
            </Link>
            <Link
              href="/chat"
              className={cn(
                "flex flex-col items-center space-y-1 text-xs",
                pathname?.startsWith("/chat") ? "text-primary" : "text-muted-foreground"
              )}
            >
              <span>チャット</span>
            </Link>
            <Link
              href="/player"
              className={cn(
                "flex flex-col items-center space-y-1 text-xs",
                pathname?.startsWith("/player") ? "text-primary" : "text-muted-foreground"
              )}
            >
              <span>プレイヤー</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

const ListItem = ({
  className,
  title,
  children,
  href,
  ...props
}: {
  className?: string;
  title: string;
  children: React.ReactNode;
  href: string;
}) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          href={href}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
}; 