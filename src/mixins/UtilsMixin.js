import { db, st } from '../main'

export default {
  methods: {
    async uploadFile (rawFile) {
      var uploadTask = st.child(rawFile.name).put(rawFile)
      var url = await uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {
        return downloadURL
      })
      return url
    },
    async updateProfile (payload) {
      var data = payload.data
      var value = payload.value
      db.collection('users').doc(this.$store.state.profile.username).update({ [data]: value })
        .then(function () {
          console.log('Successfully edited!')
        })
        .catch(function (error) {
          console.error('Error writing document: ', error)
        })
    },
    getUserData (user) {
      db.collection('users').doc(user).get().then(doc => {
        this.$store.dispatch('setProfileInfo', doc.data())
        var friends = doc.data().friends
        friends.forEach(friend => {
          db.collection('posts').where('username', '==', friend)
            .get().then(querySnapshot => {
              querySnapshot.forEach(doc => {
                this.$store.dispatch('setInitialFeed', doc.data())
              })
            })
        })
      })
    },
    getFriendsList () {
      db.collection('users').get().then(querySnapshot => {
        querySnapshot.forEach(users => {
          var user = {
            id: users.id,
            name: users.data().name,
            photo: users.data().photo,
            username: users.data().username,
            isFriend: false
          }
          this.$store.dispatch('setFriendsList', user)
        })
      })
    },
    async getUserFriendData (user) {
      await db.collection('users').doc(user).get().then(doc => {
        this.$store.dispatch('setFriendProfile', doc.data())
      })
    }
  }
}
