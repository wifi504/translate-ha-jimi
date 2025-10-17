<template>
  <div>
    哈基密钥 - View
    <div>
      <b>contactList</b>
      <div>{{ contactStore.contactList }}</div>
    </div>
    <div>
      <b>currentContact</b>
      <div>{{ contactStore.currentContact }}</div>
    </div>
    <div>
      <b>hasAuth</b>
      <div>{{ contactStore.hasAuth }}</div>
    </div>
    <div>
      <b>hasClear</b>
      <div>{{ contactStore.hasClear }}</div>
    </div>
    <hr>
    <div>
      nickname: <n-input v-model:value="nickname" type="text" style="width: 600px;" /><br>
      key({{ key.length }}): <n-input v-model:value="keyInput" type="text" style="width: 300px;" /><br>
      pass: <n-input v-model:value="pass" type="text" style="width: 600px;" /><br>
      confirmPass: <n-input v-model:value="confirmPass" type="text" style="width: 600px;" /><br>
      oldName: <n-input v-model:value="oldName" type="text" style="width: 600px;" /><br>
      newName: <n-input v-model:value="newName" type="text" style="width: 600px;" /><br>
    </div>
    <br>
    <div style="display: flex;flex-wrap: wrap; gap: 10px;">
      <n-button
        type="primary" @click="() => {
          console.log(contactStore.getSecretKey(nickname))
        }"
      >
        getSecretKey(nickname)
      </n-button>
      <n-button
        type="primary" @click="() => {
          contactStore.setSecretKey(nickname, key)
            .then(console.log)
            .catch(console.error)
        }"
      >
        setSecretKey(nickname, key)
      </n-button>
      <n-button
        type="primary" @click="() => {
          contactStore.auth(pass)
            .then(console.log)
            .catch(console.error)
        }"
      >
        auth(pass)
      </n-button>
      <n-button
        type="primary" @click="() => {
          contactStore.setPassword(pass, confirmPass)
            .then(console.log)
            .catch(console.error)
        }"
      >
        setPassword(pass, confirmPass)
      </n-button>
      <n-button
        type="primary" @click="() => {
          contactStore.clear()
        }"
      >
        clear()
      </n-button>
      <n-button
        type="primary" @click="() => {
          contactStore.rename(oldName, newName)
            .then(console.log)
            .catch(console.error)
        }"
      >
        rename(oldName, newName)
      </n-button>
      <n-button
        type="primary" @click="() => {
          contactStore.remove(nickname)
            .then(console.log)
            .catch(console.error)
        }"
      >
        remove(nickname)
      </n-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { stringToUint8Array } from '@hayalib/utils'
import { computed, ref } from 'vue'
import { useContactStore } from '@/stores/contactStore.ts'

const contactStore = useContactStore()

const nickname = ref('')
const keyInput = ref('')
const pass = ref('')
const confirmPass = ref('')
const oldName = ref('')
const newName = ref('')

const key = computed(() => stringToUint8Array(keyInput.value))
</script>

<style scoped lang="less">

</style>
