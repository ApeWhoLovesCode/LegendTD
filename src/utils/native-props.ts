import type { CSSProperties } from 'vue';

export type NativeProps<S extends string = never> = {
  className?: string;
  style?: StyleType<S>;
};

export type StyleType<S extends string = never> = CSSProperties & Partial<Record<S, string>>
