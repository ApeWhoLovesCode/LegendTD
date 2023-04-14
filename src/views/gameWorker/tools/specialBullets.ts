import { SpecialBullets } from "@/type/game";
import { reactive } from "vue";

/** 保存特殊子弹 */
export default function useSpecialBullets() {
  const specialBullets = reactive<SpecialBullets>({
    twitch: []
  })

  return {
    specialBullets
  }
}