<template>
  <div class="container">
    <div v-if="!me" class="content">
      <div uk-grid>
        <h1 class="uk-margin-top uk-width-1-1">traQ グループ編集ツール</h1>
        <div class="uk-text-lead">
          ログインしていません.
        </div>
        <div class="uk-width-1-5">
          <button class="uk-button uk-button-primary" @click="login">ログイン</button>
        </div>
      </div>
    </div>
    <div class="content uk-margin-top" v-else>
      <div uk-grid>
        <h1 class="uk-margin-top uk-width-1-1">traQ グループ編集ツール</h1>
        <div class="uk-width-1-1">
          <div v-if="groups.length > 0">
            <div uk-grid>
              <h3 class="uk-width-expand" style="line-height: 40px;">グループ一覧</h3>
              <button class="uk-button uk-button-default uk-margin-left" @click="getGroups">グループ更新</button>
            </div>
            <div>
              <ul class="uk-list uk-list-divider group">
                <li :key="group.groupId" v-for="group in groups" @click="selectGroup(group)">
                  <span class="uk-text-lead">
                    {{group.name}}
                  </span>
                  <span class="uk-text-meta">
                    {{group.description}}
                  </span>
                  <div class="uk-leader"></div>
                  <div class="uk-position-relative">
                    <span>メンバー {{group.members.length}}人</span>
                    <span>admin: {{group.adminUserId}}</span>
                    <button @click="deleteGroup(group)"
                            class="uk-button uk-button-danger uk-button-small right-button">削除
                    </button>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          <div>
            <div uk-grid>
              <div class="uk-width-1-5">
                <input class="uk-input" type="text" placeholder="Group Name" v-model="newGroupName">
              </div>
              <div class="uk-width-3-5">
                <input class="uk-input" type="text" placeholder="Group Description"
                       v-model="newGroupDescription">
              </div>
              <div class="uk-width-1-5">
                <button class="uk-button uk-button-primary" @click="newGroup">作成</button>
              </div>
            </div>
          </div>
        </div>

        <div uk-grid>
          <div class="uk-width-1-3">
            <div>
              <div v-if="curGroup">
                <h3>{{curGroup.name}}のメンバー一覧</h3>
                <div class="uk-text-meta">クリックでメンバーを削除</div>
                <div>
                  <user-list :users="curGroupMembers" height="500" @userClick="removeUser"/>
                </div>
              </div>
              <div v-else>
                <h3>グループが選択されていません</h3>
              </div>
            </div>
          </div>

          <div class="uk-width-1-3">
            <div>
              <h3>追加したいユーザーのID(スペース区切り)</h3>
              <input class="uk-input" placeholder="@foo @bar..." type="text" v-model="addUserIds">
            </div>

            <div class="uk-margin">
              <h3>メンバーに追加されるユーザー</h3>
              <button @click="addUser" class="uk-button uk-button-primary">追加</button>
              <user-list :users="willAddUser" height="500"/>
            </div>
          </div>

          <div class="uk-width-1-3">
            <div>
              <h3>グループ情報の変更</h3>
              <input class="uk-input" :placeholder="`グループ名: ${curGroup.name}`" type="text" v-model="newGroupInfo.name">
              <input class="uk-input" :placeholder="`グループの説明: ${curGroup.description}`" type="text" v-model="newGroupInfo.description">
              <input class="uk-input" :placeholder="`adminユーザーUUID: ${curGroup.adminUserId}`" type="text" v-model="newGroupInfo.adminUserId">
            </div>

            <div class="uk-margin">
              <div v-if="curGroup">
                <h3>変更対象グループ: {{curGroup.name}}</h3>
              </div>
              <div v-else>
                <h3>変更対象グループ: グループが選択されていません</h3>
              </div>
              <button @click="editGroup" class="uk-button uk-button-primary">変更</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
    import {fetchAuthToken, redirectAuthorizationEndpoint} from './oauth'
    import {Apis, Me, PatchUserGroup, User, UserGroup} from 'traq-api'
    import {AxiosResponse} from "axios"
    import UserList from './UserList.vue'

    export default {
        data(): {
            api: Apis | null
            me: Me | null
            users: User[]
            groups: UserGroup[]
            curGroup: UserGroup | null
            newGroupName: string
            addUserIds: string
            newGroupDescription: string
            newGroupInfo: PatchUserGroup
        } {
            return {
                api: null,
                me: null,
                users: [],
                groups: [],
                curGroup: null,
                newGroupName: '',
                addUserIds: '',
                newGroupDescription: '',
                newGroupInfo: {}
            }
        },
        components: {
            UserList
        },
        methods: {
            login() {
                redirectAuthorizationEndpoint()
                console.log('po')
            },
            async getGroups() {
                await this.api.getGroups().then((res: AxiosResponse<UserGroup[]>) => {
                    console.log(res)
                    this.groups = res.data
                })
            },
            selectGroup(group: UserGroup) {
                this.curGroup = group
                this.newGroupInfo = {
                    name: group.name,
                    description: group.description,
                    adminUserId: group.adminUserId
                }
            },
            async newGroup() {
                if (this.newGroupName.trim() === '') {
                    return
                }
                await this.api.createGroups({
                    name: this.newGroupName.trim(),
                    description: this.newGroupDescription
                })
                    .then(_ => {
                        this.newGroupName = ''
                        this.newGroupDescription = ''
                        return this.getGroups()
                    })
                    .catch(e => {
                        console.log(e)
                        alert('作成に失敗しました\n' + e.toString())
                    })
            },
            async editGroup() {
                if (!this.curGroup) {
                    alert('編集するグループを選択してください')
                    return
                }
                if (this.curGroup.type === 'grade') {
                    alert('学年のグループは編集できません')
                    return
                }

                if (confirm(`変更内容を確認してください。\n  グループ名: ${this.newGroupInfo.name}\n  グループの説明: ${this.newGroupInfo.description}\n  adminユーザーUUID: ${this.newGroupInfo.adminUserId}`)) {
                    await this.api.editGroup(this.curGroup.groupId, this.newGroupInfo)
                        .then(_ => {
                            console.log('updated')
                            this.newGroupInfo = {}
                            return this.getGroups()
                        })
                        .then(_ => {
                            this.curGroup = this.groups.find(g => g.groupId === this.curGroup.groupId)
                        })
                        .catch(e => {
                            console.log(e)
                            alert('更新に失敗しました\n' + e.toString())
                        })
                }
            },
            async deleteGroup(group: UserGroup) {
                if (group.type === 'grade') {
                    alert('学年のグループは編集できません')
                    return
                }

                if (confirm(`${group.name}をグループ一覧から削除しますか？`)) {
                    await this.api.deleteGroup(group.groupId)
                        .then(_ => {
                            console.log('deleted')
                            return this.getGroups()
                        })
                        .then(_ => {
                            this.curGroup = this.groups.find(g => g.groupId === this.curGroup.groupId)
                        })
                        .catch(e => {
                            console.log(e)
                            alert('削除に失敗しました\n' + e.toString())
                        })
                }
            },
            async addUser() {
                if (this.curGroup.type === 'grade') {
                    alert('学年のグループは編集できません')
                    return
                }

                await Promise.all(this.willAddUser.map(user => {
                    return this.api.addGroupMember(this.curGroup.groupId, {userId: user.userId})
                }))
                    .then(_ => {
                        console.log('successfully added')
                        return this.getGroups()
                    })
                    .then(_ => {
                        this.curGroup = this.groups.find(g => g.groupId === this.curGroup.groupId)
                    })
                    .catch(e => {
                        console.log(e)
                        alert('追加に失敗しました\n' + e.toString())
                    })
            },
            async removeUser(user) {
                if (this.curGroup.type === 'grade') {
                    alert('学年のグループは編集できません')
                    return
                }

                if (confirm(`${user.name}を${this.curGroup.name}から削除しますか？`)) {
                    await this.api.deleteGroupMember(this.curGroup.groupId, user.userId)
                        .then(_ => {
                            console.log('deleted')
                            return this.getGroups()
                        })
                        .then(_ => {
                            this.curGroup = this.groups.find(g => g.groupId === this.curGroup.groupId)
                        })
                        .catch(e => {
                            console.log(e)
                            alert('削除に失敗しました\n' + e.toString())
                        })
                }
            }
        },
        async mounted() {
            const queryParams = new URLSearchParams(location.search)
            const code = queryParams.get('code')
            const state = queryParams.get('state')
            if (code && state) {
                const verifier = sessionStorage.getItem(`login-code-verifier-${state}`)
                await fetchAuthToken(code, verifier)
                    .then(res => {
                        console.log(res)
                        this.api = new Apis({accessToken: res.data.access_token})
                        return this.api.getMe().then((me: Me) => {
                            console.log(me)
                            sessionStorage.setItem('access_token', res.data.access_token)
                            setTimeout(() => console.log('fuga'), 10000)
                            location.href = '/'
                        })
                    })
            } else {
                const accessToken = sessionStorage.getItem('access_token')
                this.api = new Apis({
                    accessToken: accessToken
                })
                await this.api.getMe().then((res: AxiosResponse<Me>) => {
                    this.me = res.data
                })
            }

            if (!this.me) {
                await redirectAuthorizationEndpoint()
            }
            await this.api.getUsers().then((res: AxiosResponse<User[]>) => {
                this.users = res.data
            })
            await this.getGroups()
        },
        computed: {
            curGroupMembers(): User[] {
                if (!this.curGroup) {
                    return []
                }

                return this.curGroup.members.map(userId => {
                    return this.users.find(user => user.userId === userId)
                })
            },
            realUsers(): User[] {
                return this.users.filter((user: User) => !user.bot && !user.suspended)
            },
            wantSetUser(): string[] {
                return this.addUserIds.split('@').map(id => id.trim())
            },
            willAddUser(): User[] {
                return this.wantSetUser.map(id => this.users.find(user => user.name === id)).filter(user => !!user)
                    .filter(user => {
                        return !this.curGroup.members.find(userId => user.userId === userId)
                    })
            }
        }
    }
</script>

<style>
  .container {
    display: flex;
    justify-content: center;
  }

  .content {
    max-width: 1200px;
  }

  .group {
    cursor: pointer;
  }

  .right-button {
    position: absolute;
    right: 0;
    bottom: 0;
  }
</style>
