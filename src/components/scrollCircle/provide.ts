import { InjectionKey } from "vue";
import { ScrollCircleProvide } from "./type";

export const provideKey = Symbol('scroll-circle') as InjectionKey<ScrollCircleProvide>

export const classPrefix = 'legendTD-scroll-circle';
