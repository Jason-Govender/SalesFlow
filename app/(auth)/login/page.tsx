"use client";
import { Alert, Button, Card, Form, Input, Typography } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import { useLoginStyles } from "./styles";
import Image from "next/image";
import { useAuthActions, useAuthState } from "@/providers/auth-provider";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const EmailPrefix = <MailOutlined />;
const PasswordPrefix = <LockOutlined />;

export default function LoginPage() {
  const { styles } = useLoginStyles();
  const router = useRouter();
  const { login } = useAuthActions();
  const { session, isPending, isError, error } = useAuthState();

  useEffect(() => {
    if (session) router.replace("/");
  }, [router, session]);

  const onFinish = async (values: { email: string; password: string }) => {
    await login(values);
  };

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

      {isError && error ? (
        <Alert
          className={styles.alert}
          type="error"
          message="Login failed"
          description={error}
          showIcon
        />
      ) : null}

      <Form layout="vertical" autoComplete="off" onFinish={onFinish}>
        <Form.Item
          name="email"
          rules={[
            { required: true, message: "Email is required." },
            { type: "email", message: "Enter a valid email address." },
          ]}
        >
          <Input prefix={EmailPrefix} placeholder="Email" />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: "Password is required." }]}
        >
          <Input.Password prefix={PasswordPrefix} placeholder="Password" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" block htmlType="submit" loading={isPending}>
            Log In
          </Button>
        </Form.Item>
      </Form>

      <Typography.Text type="secondary" className={styles.footer}>
        Don&apos;t have an account?{" "}
        <Typography.Link href="/register">Register</Typography.Link>
      </Typography.Text>
    </Card>
  );
}