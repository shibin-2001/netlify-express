import User from "../models/User.js";

// READ
export const getAllUsers = async(req,res)=>{
try{
  // console.log('im in')
  // console.log(req.params,'param')
  const {id} = req.params
  // console.log(id,'id')
const users = await User.find();
const filteredUsers = users.filter((user)=>user._id != id)
// console.log(filteredUsers,'filtered')
res.status(200).json(filteredUsers)
}catch(err){
res.status(404).json({message:err.message})
}
}
export const getUser = async (req, res) => {
  try {
    // console.log(req.params);
    const { id } = req.params;
    const user = await User.findById(id);
    res.status(200).json(user);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getUserFollowers = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    // const followers = user.followers
    const followers = await Promise.all(
      user.followers.map((id) => User.findById(id))
    );

    const formattedFollowers = followers.map(
      ({ _id, firstName, lastName, occupation, location, picturePath }) => {
        return { _id, firstName, lastName, occupation, location, picturePath };
      }
    );
    res.status(200).json(formattedFollowers);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getUserFollowing = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    const followings = await Promise.all(
      user.following.map((id) => User.findById(id))
    );

    const formattedfollowing = followings.map(
      ({ _id, firstName, lastName, occupation, location, picturePath }) => {
        return { _id, firstName, lastName, occupation, location, picturePath };
      }
    );

    res.status(200).json(formattedfollowing);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
// UPDATE

export const addRemoveFollowing = async (req, res) => {
  try {
    // console.log("im in");
    // console.log(req);
    const { id, friendId } = req.params;
    // console.log(id,friendId)
    const user = await User.findById(id);
    const friend = await User.findById(friendId);

   
// console.log(user,'before')
// console.log(friend,'before')
    if (user.following.includes(friendId) && friend.followers.includes(id)) {
      // console.log('following')
      user.following =  user.following.filter((id) => id != friendId);
      friend.followers =  friend.followers.filter((param) => param != id);
      console.log(user.following,'usert followuing')
      console.log(user.followers,'friend followers')
    } else {
      // console.log('new')
      friend.followers.push(id);
      user.following.push(friendId);
      
      let ts = Date.now();
      let date_time = new Date(ts);
      var datetime = `${date_time.getFullYear()}${
        date_time.getMonth() + 1
      }${date_time.getDate()}${date_time.getHours()}${date_time.getMinutes()}${date_time.getSeconds()}`;
      console.log(datetime, "date");

      const isThere =
      friend?.notifications.length > 0
        ? friend?.notifications?.map((prop) => {
            if (!prop.post) {
              if (prop?.userId.equals(id)) {
                return true;
              } else {
                return false;
              }
              // console.log(prop,'with post')
            } else {
              // console.log(prop,'without post')
              return false;
            }
          })
        : [false];
    console.log(isThere)
    // const isThere = [false, false, false];
    const check = isThere.every((val) => {
      // console.log(val, "vaaallll");
      return val === false;
    });
    console.log(check, "true or false");

    if (check) {
      if (post.userId != user._id) {
        // console.log('create new')
        friend.notifications.push({userId:user._id,userImg:user.picturePath,message:`${user.firstName+' '+user.lastName} started following you`,read:false,time:datetime})

      }
    } else {
      console.log("old");
      await friend.notifications.map((param) => {
        // console.log(param, "outside if");
        // console.log(param.userId, "outside if");
        // console.log(obj.userId, "outside if");
        // console.log(param.userId.equals(obj.userId), "outside if");
        if (!param.post) {
          if (param.userId.equals(id)) {
            console.log("obj found", param);
            console.log("obj split", { ...param, time: datetime });
            param.time = datetime;
            param.read = false;

            // const New = { ...param, time: datetime };
            // console.log(New, "new");
            // return New;
            
          }
          //   else {
          //     // friend.notifications.push(obj)
          //     return param;
          //   }
        }
        // else {
        //   return param;
        //  }
      });
    }


    }
console.log(friend.notifications,'frnd noti')
    await user.save();
    // console.log(user,'user')
    await friend.save();
    console.log(friend.notifications,'after frnd noti')
    console.log(friend, "friend");
    // const friends = await Promise.all(
    //   user.friends.map((id) => User.findById(id))
    // );

    // const formattedFriends = friends.map(
    //   ({ _id, firstName, lastName, occupation, location, picturePath }) => {
    //     return { _id, firstName, lastName, occupation, location, picturePath };
    //   }
    // );

    res.status(200).json(user);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

//Set read notifictions 
export const readNotifications = async(req,res)=>{
 try{

  const {id} = req.params
  const user = await User.findById(id)
  console.log(user,'user')
 const notificationsAll = await user.notifications.map((obj)=> {return{...obj,read:true}})
 console.log(notificationsAll,'not')
 const updatePost = await User.findByIdAndUpdate(
  id,
  { notifications: notificationsAll },
 
);
console.log(updatePost,'updated')
  await user.save();
  res.status(200).json(user)
  console.log(user,'user')
 }catch(err){
 
  res.status(409).json({message:err.message})
 }

}
