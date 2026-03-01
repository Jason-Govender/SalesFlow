"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Alert,
  Button,
  Card,
  Divider,
  Form,
  Input,
  Radio,
  Select,
  Typography,
} from "antd";
import { MailOutlined, LockOutlined, UserOutlined, PhoneOutlined } from "@ant-design/icons";
import { useRegisterStyles } from "./styles";
import type { RegisterPayload, RegisterRoleOption } from "@/providers/auth-provider/context";
import { useAuthActions, useAuthState } from "@/providers/auth-provider";

const VALID_JOIN_ROLES: RegisterRoleOption[] = [
  "SalesRep",
  "SalesManager",
  "BusinessDevelopmentManager",
];

function isRegisterRoleOption(value: string | null): value is RegisterRoleOption {
  return value !== null && VALID_JOIN_ROLES.includes(value as RegisterRoleOption);
}

type Scenario = "create-org" | "join-org";

type RegisterFormValues = {
  scenario: Scenario;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  tenantName?: string;
  tenantId?: string;
  role?: RegisterRoleOption;
};

const EmailPrefix = <MailOutlined />;
const PasswordPrefix = <LockOutlined />;
const NamePrefix = <UserOutlined />;
const PhonePrefix = <PhoneOutlined />;

export default function RegisterPageContent() {
  const { styles } = useRegisterStyles();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register } = useAuthActions();
  const { session, isPending, isError, error } = useAuthState();
  const [scenarioChoice, setScenarioChoice] = useState<Scenario>("create-org");
  const [form] = Form.useForm<RegisterFormValues>();

  const inviteTenantId = searchParams.get("tenantId")?.trim() ?? "";
  const inviteRoleParam = searchParams.get("role")?.trim() ?? "";
  const fromInviteLink =
    Boolean(inviteTenantId) && isRegisterRoleOption(inviteRoleParam);
  const scenario: Scenario = fromInviteLink ? "join-org" : scenarioChoice;

  useEffect(() => {
    if (session) router.replace("/");
  }, [router, session]);

  useEffect(() => {
    if (fromInviteLink && inviteTenantId && inviteRoleParam) {
      form.setFieldsValue({
        scenario: "join-org",
        tenantId: inviteTenantId,
        role: inviteRoleParam as RegisterRoleOption,
      });
    }
  }, [fromInviteLink, inviteTenantId, inviteRoleParam, form]);

  const roleOptions = useMemo(
    () =>
      [
        { label: "Sales Rep", value: "SalesRep" },
        { label: "Sales Manager", value: "SalesManager" },
        { label: "Business Development Manager", value: "BusinessDevelopmentManager" },
      ] satisfies { label: string; value: RegisterRoleOption }[],
    []
  );

  const onScenarioChange = (value: Scenario) => {
    setScenarioChoice(value);
    form.setFieldsValue({ scenario: value });
  };

  const onFinish = async (values: RegisterFormValues) => {
    const base = {
      email: values.email,
      password: values.password,
      firstName: values.firstName,
      lastName: values.lastName,
      phoneNumber: values.phoneNumber || undefined,
    };

    let payload: RegisterPayload;

    if (values.scenario === "create-org") {
      payload = {
        ...base,
        tenantName: values.tenantName ?? "",
      };
    } else {
      payload = {
        ...base,
        tenantId: values.tenantId ?? "",
        role: values.role ?? "SalesRep",
      };
    }

    await register(payload);
  };

  return (
    <Card className={styles.card} variant="outlined">
      <div className={styles.header}>
        <Image
          src="/logo2.png"
          alt="SalesFlow Logo"
          width={300}
          height={100}
          priority
        />
        <Typography.Text type="secondary" className={styles.subtitle}>
          Create your account
        </Typography.Text>
      </div>

      {fromInviteLink ? (
        <Typography.Text type="secondary" className={styles.subtitle} style={{ display: "block", marginBottom: 16 }}>
          You&apos;re joining your organisation. Complete your details below.
        </Typography.Text>
      ) : null}

      {isError && error ? (
        <Alert
          className={styles.alert}
          type="error"
          message="Registration failed"
          description={error}
          showIcon
        />
      ) : null}

      <Form<RegisterFormValues>
        form={form}
        layout="vertical"
        autoComplete="off"
        onFinish={onFinish}
        initialValues={{ scenario }}
      >
        {!fromInviteLink ? (
          <>
            <Form.Item name="scenario" label="Organisation setup">
              <Radio.Group
                onChange={(e) => onScenarioChange(e.target.value as Scenario)}
                value={scenarioChoice}
              >
                <Radio value="create-org">Create a new organisation</Radio>
                <Radio value="join-org">Join an existing organisation</Radio>
              </Radio.Group>
            </Form.Item>
            <Divider />
          </>
        ) : null}

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Email is required." },
            { type: "email", message: "Enter a valid email address." },
          ]}
        >
          <Input prefix={EmailPrefix} placeholder="you@company.com" />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: "Password is required." }]}
        >
          <Input.Password prefix={PasswordPrefix} placeholder="Password" />
        </Form.Item>

        <Form.Item
          name="firstName"
          label="First name"
          rules={[{ required: true, message: "First name is required." }]}
        >
          <Input prefix={NamePrefix} placeholder="First name" />
        </Form.Item>

        <Form.Item
          name="lastName"
          label="Last name"
          rules={[{ required: true, message: "Last name is required." }]}
        >
          <Input prefix={NamePrefix} placeholder="Last name" />
        </Form.Item>

        <Form.Item name="phoneNumber" label="Phone number (optional)">
          <Input prefix={PhonePrefix} placeholder="+27..." />
        </Form.Item>

        {scenario === "create-org" ? (
          <Form.Item
            name="tenantName"
            label="Organisation name"
            rules={[{ required: true, message: "Organisation name is required." }]}
          >
            <Input placeholder="Acme Corp" />
          </Form.Item>
        ) : null}

        {scenario === "join-org" && !fromInviteLink ? (
          <>
            <Form.Item
              name="tenantId"
              label="Tenant ID"
              rules={[{ required: true, message: "Tenant ID is required." }]}
            >
              <Input placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" />
            </Form.Item>

            <Form.Item
              name="role"
              label="Role"
              rules={[{ required: true, message: "Role is required." }]}
            >
              <Select options={roleOptions} placeholder="Select role" />
            </Form.Item>
          </>
        ) : null}

        {scenario === "join-org" && fromInviteLink ? (
          <>
            <Form.Item name="tenantId" hidden>
              <Input type="hidden" />
            </Form.Item>
            <Form.Item name="role" hidden>
              <Input type="hidden" />
            </Form.Item>
          </>
        ) : null}

        <Form.Item>
          <Button type="primary" block htmlType="submit" loading={isPending}>
            Create account
          </Button>
        </Form.Item>
      </Form>

      <Typography.Text type="secondary" className={styles.footer}>
        Already have an account?{" "}
        <Typography.Link href="/login">Log in</Typography.Link>
      </Typography.Text>
    </Card>
  );
}
