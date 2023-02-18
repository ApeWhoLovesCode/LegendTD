<script setup lang='ts'>
import { onMounted, ref, reactive } from 'vue';
import {ElButton, ElDialog, ElForm, ElFormItem, ElInput, FormInstance} from 'element-plus'

const {visible} = defineProps({
  visible: {
    type: Boolean,
    default: false,
    require: true
  }
})

const emit = defineEmits<{
  (event: 'update:visible', v: boolean): void
}>()

const ruleFormRef = ref<FormInstance>()
const userInfo = reactive({
  name: '',
  pass: '',
})

const validateName = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请输入用户名'))
  } else {
    if (!ruleFormRef.value) return
    callback()
  }
}
const validatePass = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请输入密码'))
  } else {
    if (!ruleFormRef.value) return
    ruleFormRef.value.validateField('checkPass', () => null)
    callback()
  }
}

const rules = reactive({
  name: [{ validator: validateName, trigger: 'blur' }],
  pass: [{ validator: validatePass, trigger: 'blur' }],
})

const login = () => {
  emit('update:visible', false)
}

</script>

<template>
  <ElDialog 
    v-model="visible"
    title="登录"
    width="60%"
    draggable
    @close="emit('update:visible', false)"
  >
    <ElForm
      ref="ruleFormRef"
      :model="userInfo"
      :rules="rules"
      label-width="100px"
    >
      <ElFormItem label="用户名" prop="name">
        <ElInput v-model="userInfo.name" show-word-limit maxLength="10" />
      </ElFormItem>
      <ElFormItem label="密码" prop="pass">
        <ElInput v-model="userInfo.pass" type="password" autocomplete="off" show-word-limit maxLength="10" />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="emit('update:visible', false)">取消</ElButton>
        <ElButton type="primary" @click="login">登录</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<style lang='less'>

</style>