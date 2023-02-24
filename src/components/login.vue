<script setup lang='ts'>
import { ref, reactive } from 'vue';
import {ElButton, ElDialog, ElForm, ElFormItem, ElInput, ElMessage, FormInstance} from 'element-plus'
import { useUserInfoStore } from '@/stores/userInfo';
import { useSourceStore } from '@/stores/source';

const source = useSourceStore()

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

const userInfoStore = useUserInfoStore()
const userInfo = reactive({
  name: '',
  pass: '',
})

const ruleFormRef = ref<FormInstance>()
const rules = reactive({
  name: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 10, message: '用户名应在3-10位之间', trigger: 'blur' },
  ],
  pass: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 3, max: 10, message: '密码应在3-10位之间', trigger: 'blur' },
  ],
})

const login = () => {
  ruleFormRef.value?.validate(valid => {
    if(!valid) return
    userInfoStore.login({
      username: userInfo.name,
      password: userInfo.pass
    }).then((res) => {
      if(res) {
        emit('update:visible', false)
        ElMessage.success('登录成功')
      }
    })
  })
}

</script>

<template>
  <ElDialog 
    v-model="visible"
    title="登录"
    :width="source.isMobile ? '85%' : '50%'"
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
        <ElInput v-model="userInfo.name" show-word-limit maxlength="10" />
      </ElFormItem>
      <ElFormItem label="密码" prop="pass">
        <ElInput v-model="userInfo.pass" type="password" autocomplete="off" show-word-limit maxlength="10" />
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

<style lang='less' scoped>

</style>