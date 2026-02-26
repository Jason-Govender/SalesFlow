"use client";
import { Card, Form, Input, Button, Typography } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import { useLoginStyles } from "./styles";
import Image from "next/image";

const EmailPrefix = <MailOutlined />;
const PasswordPrefix = <LockOutlined />;

export default function LoginPage() {
  const { styles } = useLoginStyles();

  return (
    <Card className={styles.card} variant="outlined">
      <div className={styles.header}>
        <Image
          src="/logo1.png"
          alt="SalesFlow Logo"
          width={300}
          height={100}
          priority
        />
        <Typography.Text type="secondary" className={styles.subtitle}>
          Log in to your account
        </Typography.Text>
      </div>

      <Form layout="vertical" autoComplete="off">
        <Form.Item name="email">
          <Input prefix={EmailPrefix} placeholder="Email" />
        </Form.Item>

        <Form.Item name="password">
          <Input.Password prefix={PasswordPrefix} placeholder="Password" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" block>
            Log In
          </Button>
        </Form.Item>
      </Form>

      <Typography.Text type="secondary" className={styles.footer}>
        Don&apos;t have an account? <Typography.Link>Register</Typography.Link>
      </Typography.Text>
    </Card>
  );
}