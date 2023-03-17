<script setup lang='ts'>
import { ElButton, ElCol, ElDrawer, ElInput, ElMessage, ElRow, ElForm, ElFormItem, FormInstance } from 'element-plus';
import { Check } from '@element-plus/icons-vue'
import { reactive, ref } from 'vue';
import { editPassApi, editUserApi, EditUserParams } from '@/service/userInfo'
import { UserInfo, useUserInfoStore } from '@/stores/userInfo';
import { validatePhone } from '@/utils/validate';

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
  avatar: userInfoStore.userInfo?.avatar ?? '',
  name: userInfoStore.userInfo?.name ?? '',
  phone: userInfoStore.userInfo?.phone ?? '',
  pass: '',
  passNew: '',
})

const ruleFormRef_name = ref<FormInstance>()
const ruleFormRef_phone = ref<FormInstance>()
const ruleFormRef_pass = ref<FormInstance>()

const rules_name = reactive({
  name: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 10, message: '用户名应在3-10位之间', trigger: 'blur' },
  ],
})
const rules_phone = reactive({
  phone: [{ validator: validatePhone, trigger: 'blur' }],
})
const rules_pass = reactive({
  pass: [
    { required: true, message: '请输入原密码', trigger: 'blur' },
    { min: 3, max: 10, message: '密码应在3-10位之间', trigger: 'blur' },
  ],
  passNew: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 3, max: 10, message: '密码应在3-10位之间', trigger: 'blur' },
  ],
})

const editUserInfo = async (params: Omit<EditUserParams, 'id'>, ruleFormRef?: FormInstance) => {
  ruleFormRef?.validate(async valid => {
    if(valid) {
      try {
        const res = await editUserApi({id: userInfoStore.userInfo!.id, ...params})
        userInfoStore.userInfo = res
        ElMessage.success('修改成功')
      } catch (error) {
        console.log('error: ', error);
      }
    }
  })
}

const editPassword = () => {
  ruleFormRef_pass.value?.validate(async valid => {
    if(valid) {
      editPassApi({
        id: userInfoStore.userInfo!.id,
        password: userInfo.pass,
        newPassword: userInfo.passNew
      }).then(() => {
        ElMessage.success('密码修改成功')
      }).catch(error => {
        console.log('error: ', error);
      })
    }
  })
}

const initData = () => {
  const { avatar = '', name = '', phone = '' } = userInfoStore.userInfo as UserInfo
  userInfo.avatar = avatar
  userInfo.name = name
  userInfo.phone = phone
  userInfo.pass = ''
  userInfo.passNew = ''
}

</script>

<template>
  <ElDrawer
    :modelValue="visible"
    direction="ltr"
    :size="380"
    @open="initData"
    @close="emit('update:visible', false)"
  >
    <template #header>
      <h4>用户信息</h4>
    </template>
    <template #default>
      <ElRow class="row">
        <ElCol :span="24">
          头像
        </ElCol>
      </ElRow>
      <ElForm
        ref="ruleFormRef_name"
        :model="userInfo"
        :rules="rules_name"
        hide-required-asterisk
      >
        <ElFormItem label="用户名" prop="name">
          <div class="row">
            <ElInput 
              v-model="userInfo.name" 
              maxlength="10" 
              show-word-limit 
            ></ElInput>
            <ElButton
              type="primary"
              :icon="Check"
              size="small"
              plain
              circle
              class="btn"
              @click="editUserInfo({username: userInfo.name}, ruleFormRef_name)"
            ></ElButton>
          </div>
        </ElFormItem>
      </ElForm>
      <ElForm
        ref="ruleFormRef_phone"
        :model="userInfo"
        :rules="rules_phone"
        hide-required-asterisk
      >
        <ElFormItem label="手机号" prop="phone">
          <div class="row">
            <ElInput 
              v-model="userInfo.phone" 
              maxlength="11" 
              show-word-limit 
            ></ElInput>
            <ElButton
              type="primary"
              :icon="Check"
              size="small"
              plain
              circle
              class="btn"
              @click="editUserInfo({phone: userInfo.phone}, ruleFormRef_phone)"
            ></ElButton>
          </div>
        </ElFormItem>
      </ElForm>
      <ElForm
        ref="ruleFormRef_pass"
        :model="userInfo"
        :rules="rules_pass"
        hide-required-asterisk
      >
        <ElFormItem label="原密码" prop="pass">
          <div class="row">
            <ElInput 
              v-model="userInfo.pass" 
              type="password"
              show-password
              maxlength="10" 
            ></ElInput>
            <ElButton size="small" class="btn btn-placeholder"></ElButton>
          </div>
        </ElFormItem>
        <ElFormItem label="新密码" prop="passNew">
          <div class="row">
            <ElInput 
              v-model="userInfo.passNew" 
              type="password"
              show-password
              maxlength="10" 
            ></ElInput>
            <ElButton
              type="primary"
              :icon="Check"
              size="small"
              plain
              circle
              class="btn"
              @click="editPassword"
            ></ElButton>
          </div>
        </ElFormItem>
      </ElForm>
    </template>
  </ElDrawer>
</template>

<style lang='less' scoped>
.row {
  display: flex;
  align-items: center;
  width: 100%;
  .btn {
    margin-left: 10px;
  }
  .btn-placeholder {
    visibility: hidden;
  }
}
</style>