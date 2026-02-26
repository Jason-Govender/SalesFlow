"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Layout, Menu, Dropdown } from "antd";
import {
  HomeOutlined,
  FolderOutlined,
  TeamOutlined,
  CalendarOutlined,
  FileTextOutlined,
  DownOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { useAuthState, useAuthActions } from "@/providers/auth-provider";
import { useAppShellStyles } from "./styles";

const { Sider, Content } = Layout;

const SIDEBAR_WIDTH = 256;

function formatRole(role: string): string {
  return role
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { styles } = useAppShellStyles();
  const pathname = usePathname();
  const { session } = useAuthState();
  const { logout } = useAuthActions();

  const menuItems: MenuProps["items"] = [
    { key: "/", icon: <HomeOutlined />, label: <Link href="/">Dashboard</Link> },
    {
      key: "/proposals",
      icon: <FolderOutlined />,
      label: <Link href="/proposals">Proposals</Link>,
    },
    {
      key: "/clients",
      icon: <TeamOutlined />,
      label: <Link href="/clients">Clients</Link>,
    },
    {
      key: "/activities",
      icon: <CalendarOutlined />,
      label: <Link href="/activities">Activities</Link>,
    },
    {
      key: "/contracts",
      icon: <FileTextOutlined />,
      label: <Link href="/contracts">Contracts</Link>,
    },
  ];

  const pathKeys = ["/", "/proposals", "/clients", "/activities", "/contracts"];
  const selectedKey =
    pathname === "/"
      ? "/"
      : pathKeys
          .filter((k) => k !== "/" && pathname.startsWith(k))
          .sort((a, b) => b.length - a.length)[0] ?? pathname;

  const userDropdownItems: MenuProps["items"] = [
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Log out",
      onClick: () => logout(),
    },
  ];

  const displayName = session?.user
    ? `${session.user.firstName} ${session.user.lastName}`
    : "";
  const displayRole = session?.user?.roles?.[0]
    ? formatRole(session.user.roles[0])
    : "";

  return (
    <Layout className={styles.layoutRoot}>
      <Sider width={SIDEBAR_WIDTH} className={styles.sider}>
        <div className={styles.logo}>
          <Image
            src="/logo1.png"
            alt="SalesFlow"
            width={200}
            height={100}
            className={styles.logoImage}
          />
        </div>
        <Menu
          mode="inline"
          selectedKeys={[String(selectedKey)]}
          items={menuItems}
          className={styles.menu}
        />
        <div className={styles.userSection}>
          <Dropdown
            menu={{ items: userDropdownItems }}
            trigger={["click"]}
            placement="topRight"
          >
            <button
              type="button"
              className={styles.userButton}
              aria-label="User menu"
            >
              <div className={styles.userInfo}>
                <span className={styles.userName}>{displayName}</span>
                <span className={styles.userRole}>{displayRole}</span>
              </div>
              <DownOutlined className={styles.userChevron} />
            </button>
          </Dropdown>
        </div>
      </Sider>
      <Layout className={styles.mainLayout}>
        <Content className={styles.content}>{children}</Content>
      </Layout>
    </Layout>
  );
}
