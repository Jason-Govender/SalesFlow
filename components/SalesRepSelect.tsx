"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Select } from "antd";
import { usersService, type IUser } from "@/utils/users-service";

const PAGE_SIZE = 100;
const DEBOUNCE_MS = 300;

function displayLabel(user: IUser): string {
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  if (name) return user.email ? `${name} (${user.email})` : name;
  return user.email ?? user.id;
}

export interface SalesRepSelectProps {
  value?: string;
  onChange?: (userId: string | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  /** Filter by role; default "SalesRep" for sales rep dropdown */
  role?: string;
  /** Include inactive users; default false */
  includeInactive?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function SalesRepSelect({
  value,
  onChange,
  placeholder = "Select sales rep",
  disabled = false,
  role = "SalesRep",
  includeInactive = false,
  className,
  style,
}: SalesRepSelectProps) {
  const [options, setOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadUsers = useCallback(
    async (term: string) => {
      setLoading(true);
      try {
        const res = await usersService.list({
          role,
          searchTerm: term || undefined,
          isActive: includeInactive ? undefined : true,
          pageNumber: 1,
          pageSize: PAGE_SIZE,
        });
        const opts = (res.items ?? []).map((u) => ({
          value: u.id,
          label: displayLabel(u),
        }));
        setOptions(opts);
      } catch {
        setOptions([]);
      } finally {
        setLoading(false);
      }
    },
    [role, includeInactive]
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      loadUsers(searchTerm);
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchTerm, loadUsers]);

  const handleDropdownVisibleChange = (open: boolean) => {
    if (open) loadUsers(searchTerm);
  };

  return (
    <Select
      value={value || undefined}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      loading={loading}
      showSearch
      filterOption={false}
      onSearch={setSearchTerm}
      onDropdownVisibleChange={handleDropdownVisibleChange}
      options={options}
      allowClear
      className={className}
      style={style}
      optionFilterProp="label"
    />
  );
}
