<template>
  <div class="user-list-container">
    <ul class="uk-list uk-list-divider" :style="{'height': height + 'px', 'overflow-y': 'scroll'}">
      <li class="user" :key="user.userId" v-for="user in users" @click="$emit('userClick', user)">
        <div class="user-icon-wrap">
          <div class="user-icon" :style="`background-image: url(https://q.trap.jp/api/1.0/public/icon/${user.name})`" alt=""></div>
        </div>
        <div class="user-name">@{{user.name}}</div>
      </li>
    </ul>
  </div>
</template>

<style>
  .user-list-container {
    padding-left: 12px;
    padding-right: 12px;
    width: 300px;
  }
  .user {
    display: flex;
    margin-top: 12px;
    margin-bottom: 12px;
    cursor: pointer;
  }

  .user-icon-wrap {
    grid-area: user-icon;
  }

  .user-icon {
    width: 40px;
    height: 40px;
    border-radius: 40px;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: 50%;
  }

  .user-name {
    margin-left: 8px;
    line-height: 40px;
    text-align: center;
  }
</style>

<script lang="ts">
  export default {
    props: ['users', 'height']
  }
</script>
