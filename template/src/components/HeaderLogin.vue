<template>
  <ul class="user_state">
    <li v-if="auth">
        <v-menu
            v-model="menu"
            transition="slide-x-transition"
            :close-on-content-click="false"
            :nudge-width="200"
            :nudge-right="50"
            offset-y
            bottom
          >
      <template v-slot:activator="{ on }">
          <v-btn class="user_btn_fab" fab light small v-on="on">
              <v-icon>person</v-icon>
          </v-btn>
      </template>
      <v-card>
        <v-list>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>{{user.UserName}}</v-list-item-title>
              <v-list-item-subtitle>{{user.FirstName}} {{user.LastName}}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" class="user_btn" small outlined  @click="onLogout">
            Logout
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-menu>
    </li>
  </ul>
</template>
<script>
export default {
    data(){
        return {
          menu: false,
        };
    },
    created(){
        this.$store.dispatch('fetchUser');
    },
   computed: {
      auth () {
        return this.$store.getters.isAuthenticated;
      },
      user (){
        return this.$store.getters.user;
      }
    },
    methods: {
      onLogout() {
        this.$store.dispatch('logout');
      }
    }
}
</script>
<style scoped>
.user_state{
    /* position: absolute;
    right: 0;
    top: 0; */
    list-style: none;
}
.user_btn{
  text-transform: unset;
}
.user_btn_fab{
  height: 30px;
  width: 30px;
}
</style>
<style>
.user_btn .v-icon--right{
  margin-left: 5px !important;
}
</style>



