<template>
    <div class="fill-height">
        <v-container class="fill-height" fluid :v-if="loading">
            <v-row justify="center" align-content="center" align="center" class="fill-height">
                <v-col  >
                  <p class="loading_text">Please wait for authentication...</p>
                  <v-progress-circular :size="35" :width="3" color="grey" indeterminate >
                  </v-progress-circular>
                </v-col>
            </v-row>
        </v-container>
         <v-snackbar
            v-model="errorLoading"
            color="info"
            :timeout="0"
            :top="true"
          >
            {{ errorMsg }}
            <v-btn
              dark
              text
              @click="errorLoading = false"
            >
              Close
            </v-btn>
          </v-snackbar>
    </div>

</template>
<script>
import webmms from "webmms-client";
import { set as setCookie, get as getCookie, remove as removeCookie } from "es-cookie";
import { setTimeout } from 'timers';
import conf from '@/config/config';

export default {
 data() {
    return {
      loading: true,
      errorMsg: '',
      errorLoading: false,
      yp:{
        ddn: 'UC',
        topic: '',
        func: 'ucGetUserInfo'
      },
       webmmsOptions : {
          EiToken: '',
          SToken: '',
          UToken: ''
      },
      eiInfo: {
        eiName: '',
        eiTag: '',
        ddn : ''
      },
      oauthParams : {
        access_token : null,
        stoken: null,
        eitoken: null
      }
    }
  },
  async created() {
      this.readQueryParam();
      this.startMMS();
  },
  async beforeMount() {
      await this.subscribeMMS();
  },
  beforeDestroy() {
    this.removeEvent();
  },
  methods : {
     startMMS(){
          this.mms =  webmms({
            wsurl: conf.wsurl,
            EiToken: this.oauthParams.eitoken || "",
            SToken: this.oauthParams.stoken || ""
          });
      },
      readQueryParam(){
         this.oauthParams = this.$route.query;
      },
      async login(){
          const { ddn, topic, func } = this.yp;
          this.isLoading = true;
          this.loading = true;
          let res;

          try {
               res = await this.mms.callMMS({
                  DDN : ddn,
                  topic : topic,
                  func: func,
                  payload: []
              });
              console.log(res);
          } catch (error) {
              console.log(error);
          }
          this.loading = false;
          this.isLoading = false;

           if(res){
                let result;
                if(typeof res == 'object')
                    result = res;
                else
                    result = res[0];
               if(Array.isArray(result))
                    result = result[0];
               console.log(result);

               if(result.ErrMsg != 'OK'){
                    this.errorLoading = true;
                    this.errorMsg = result.ErrMsg;
                }else if(result.ErrMsg == 'OK'){
                  this.errorLoading = false;
                  result.UserInfo.expiresIn = 60;
                  this.$store.dispatch('login', result.UserInfo);
                  this.$router.push("hello");
                }
            }

      },
      async subscribeMMS() {
        this.removeEvent = this.mms.on("registered", async reply => {
            console.log('reply=%s', JSON.stringify(reply))
             if(reply.ErrMsg == "OK"){
                this.eiInfo.ddn = reply.result.DDN;
                this.webmmsOptions.EiToken = reply.result.EiToken;
                this.webmmsOptions.SToken = reply.result.SToken;
                this.webmmsOptions.UToken = reply.result.UToken;
                if(this.eiInfo.eiName == ''){
                  this.eiInfo.eiName = reply.result.EiName ? reply.result.EiName : 'jbSIGN' + this.makeId(5);
                }
                 if(this.eiInfo.eiTag == ''){
                  this.eiInfo.eiTag = reply.result.EiTag ? reply.result.EiTag : '';
                }
             }

             let expiredTime = 60 * 60 * 24 * 30 * 12;

             setCookie("login-EiToken", this.webmmsOptions.EiToken);
             setCookie("login-SToken", this.webmmsOptions.SToken);

            console.log('regtoCenter: %s', reply.ErrMsg);
            this.mmsReady = true;
            this.error = false;
            let deviceInfo = {"DDN":this.eiInfo.ddn,"EiOwner":"","EiName":this.eiInfo.eiName,"EiType":".web","EiTag":this.eiInfo.eiTag,"EiLoc":""};
             let result = await this.mms.setDeviceInfo(deviceInfo);
             console.log('SetDevice reply=%s', JSON.stringify(result));
            this.login();
        });

        this.mms.on('message', (method, from, data, body) => {
             this.mmsReady = true;
             this.error = false;
             console.log('rcve: from=%s, data=%s', from, JSON.stringify(data));
            if(typeof data == 'object' && !data.from)
              data.from = from;
            //body.sender = data;
            if(data)
            {

              //this.eventList.push(data.data);


            }
        });

        this.mms.on('state', msg => {
            console.log('WS error: %s', msg);
            this.mmsReady = false;
            this.error = true;
        });

        this.mms.on('disconnect', msg => {
            this.mmsReady = false;
            this.error = true;
        });

        this.mms.on('error', err => {
             this.mmsReady = false;
            this.error = true;
        });

        this.mms.on('connect_error', err => {
            this.mmsReady = false;
            this.error = true;
        });

        this.mms.on('connect_timeout', err => {
            this.mmsReady = false;
            this.error = true;
        });
      }
  }
}
</script>
<style scoped>
 .loading{
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left:0;
  z-index: 50;
  background-color: rgba(255, 255, 255, 0.4196078431372549);
}
.loading_text{
      font-weight: bold;
    color: #000;
    font-size: 11pt;
}
</style>
