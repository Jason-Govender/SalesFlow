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
  DollarOutlined,
  DownOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { useAuthState, useAuthActions } from "@/providers/auth-provider";
import { isSalesRepOnly } from "@/utils/route-roles";
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
  const showDashboardInNav = !isSalesRepOnly(session?.user?.roles);
  const menuItems: MenuProps["items"] = showDashboardInNav
    ? [
        { key: "/", icon: <HomeOutlined />, label: <Link href="/">Dashboard</Link> },
        {
          key: "/opportunities",
          icon: <FolderOutlined />,
          label: <Link href="/opportunities">Opportunities</Link>,
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
        {
          key: "/pricing-requests",
          icon: <DollarOutlined />,
          label: <Link href="/pricing-requests">Pricing Requests</Link>,
        },
      ]
    : [
        {
          key: "/opportunities",
          icon: <FolderOutlined />,
          label: <Link href="/opportunities">Opportunities</Link>,
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
        {
          key: "/pricing-requests",
          icon: <DollarOutlined />,
          label: <Link href="/pricing-requests">Pricing Requests</Link>,
        },
      ];

  const pathKeys = (menuItems ?? [])
    .map((i) => (i && typeof i.key === "string" ? i.key : null))
    .filter((k): k is string => k != null);
  const selectedKey =
    pathname === "/"
      ? "/"
      : pathname?.startsWith("/opportunities")
        ? "/opportunities"
        : pathname?.startsWith("/contracts")
          ? "/contracts"
          : pathname?.startsWith("/pricing-requests")
            ? "/pricing-requests"
            : pathKeys
              .filter((k) => k !== "/" && k !== "/opportunities" && k !== "/contracts" && k !== "/pricing-requests" && pathname.startsWith(k))
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
            src="/logo2.png"
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
