<script setup lang='ts'>
import { ref, reactive, watch } from 'vue';
import {ElButton, ElDialog, ElForm, ElFormItem, ElInput, ElMessage, ElSwitch, FormInstance, FormItemRule} from 'element-plus'
import { useUserInfoStore } from '@/stores/userInfo';
import { useSourceStore } from '@/stores/source';
import { Arrayable } from 'element-plus/es/utils';
import { registerApi } from '@/service/login';

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
  passAgain: '',
})
const isRegister = ref(false)

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
  passAgain: [] as Arrayable<FormItemRule>
})

const validatePassAgain = (rule: any, value: any, callback: any) => {
  if(value === '') {
    callback(new Error('请再次输入密码'))
  } else {
    if(userInfo.pass !== userInfo.passAgain) {
      callback(new Error('两次密码不一致'))
    }
    callback()
  }
}

watch(isRegister, () => {
  if(isRegister) {
    rules.passAgain = [
      { required: true, validator: validatePassAgain, trigger: 'blur' },
      { min: 3, max: 10, message: '密码应在3-10位之间', trigger: 'blur' },
    ]
  } else {
    rules.passAgain = []
  }
})

const loginOrRegister = () => {
  ruleFormRef.value?.validate(valid => {
    if(!valid) return
    const params = {
      username: userInfo.name,
      password: userInfo.pass
    }
    if(!isRegister.value) {
      userInfoStore.login(params).then((res) => {
        if(res) {
          emit('update:visible', false)
          ElMessage.success('登录成功')
          clearData()
        }
      })
    } else {
      registerApi(params).then(res => {
        if(res) {
          isRegister.value = false
          ElMessage.success('注册成功')
        }
      })
    }
  })
}

const clearData = () => {
  userInfo.name = ''
  userInfo.pass = ''
  userInfo.passAgain = ''
}

</script>

<template>
  <ElDialog 
    :modelValue="visible"
    :title="isRegister ? '注册' : '登录'"
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
        <ElInput v-model="userInfo.name" show-word-limit maxlength="10" @keyup.enter.native="loginOrRegister" />
      </ElFormItem>
      <ElFormItem label="密码" prop="pass">
        <ElInput v-model="userInfo.pass" type="password" show-password maxlength="10" @keyup.enter.native="loginOrRegister" />
      </ElFormItem>
      <ElFormItem v-if="isRegister" label="确认密码" prop="passAgain">
        <ElInput v-model="userInfo.passAgain" type="password" show-password maxlength="10" @keyup.enter.native="loginOrRegister" />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <div class="dialog-footer">
        <div class="tipsWrap">
          <div class="tips">没有账号？点这里</div>
          <ElSwitch size="small" v-model="isRegister" active-text="注册" inactive-text="登录" />
        </div>
        <div>
          <ElButton @click="emit('update:visible', false)">取消</ElButton>
          <ElButton v-if="!isRegister" type="primary" @click="loginOrRegister" >登录</ElButton>
          <ElButton v-else type="primary" @click="loginOrRegister">注册</ElButton>
        </div>
      </div>
    </template>
  </ElDialog>
</template>

<style lang='less' scoped>
.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  .tipsWrap {
    font-size: 12px;
  }
}
</style>