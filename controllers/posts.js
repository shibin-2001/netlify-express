import Post from "../models/Post.js";
import User from "../models/User.js";

// CREATE

export const createPost = async (req, res) => {
  try {
    const { userId, description, picturePath } = req.body;
    const user = await User.findById(userId);

    const newPost = new Post({
      userId,
      userPicturePath: user.picturePath,
      firstName: user.firstName,
      lastName: user.lastName,
      location: user.location,
      description,
      picturePath,
      likes: {},
      comments: [],
    });

    await newPost.save();
    const post = await Post.find({ userId: userId }).sort({ updatedAt: -1 });
    const posts = await Promise.all(
      user.following.map((id) => Post.find({ userId: id }))
    );
    // console.log(post,'post')
    // console.log(posts.flat(),'filterd posts')
    res.status(201).json(
      [...post, ...posts.flat()].sort(function (a, b) {
        return b.updatedAt - a.updatedAt;
      })
    );
  } catch (err) {
    res.status(409).json({ message: err.message });
  }
};

export const createComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment, userId } = req.body;
    const post = await Post.findById(id);
    const user = await User.findById(userId);
    const friend = await User.findById(post.userId);

    const updatedComment = {
      userId: userId,
      comment: comment,
      picturePath: user.picturePath,
      firstName: user.firstName,
      lastName: user.lastName,
    };
    post.comments.push(updatedComment);
    await post.save();

    res.status(201).json(post);
    if (post.userId !== user._id) {
      var datetime = new Date().toLocaleString();
      const obj = {
        userId: user._id,
        userImg: user.picturePath,
        message: `${
          user.firstName + " " + user.lastName
        } commented ${comment} on your post`,
        read: false,
        time: datetime,
        post,
      };
      friend.notifications.push(obj);
    }
    await friend.save();
  } catch (err) {
    res.status(409).json({ message: err.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment, userId } = req.body;

    const post = await Post.findById(id);

    const filtered = await post.comments.filter(
      (param) =>
        // if (
        param.userId === userId && param.comment === comment
      // ) {
      //  console.log('found',param)

      // } return param
    );
    const OtherComments = await post.comments.filter(
      (param) => param != filtered[0]
    );

    // post.comments.remove(filtered)
    post["comments"] = OtherComments;
    await post.save();

    res.status(200).json(post);
  } catch (err) {
    res.status(409).json({ message: err.message });
  }
};
// READ

export const getFeedPosts = async (req, res) => {
  try {
    // console.log('im in')
    const { userId } = req.params;
    const user = await User.findById(userId);
    // console.log(user,'user')
    const post = await Post.find();
    const userPost = await Post.find({ userId });
    const formatted = user.following?.map((id) =>
      post.filter((post) => post.userId === id)
    );
    // console.log(formatted?.flat(),'formatted post')
    const filtered = formatted?.flat();
    // console.log(filtered,'filtered')
    // console.log(userPost,'userpost')
    const AllPosts = [...filtered, ...userPost].sort(function (a, b) {
      return b.updatedAt - a.updatedAt;
    });

      
   
    // console.log(AllWithLikes, "all posts");
    res.status(200).json(AllPosts);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const posts = await Post.find({ userId }).sort({ updatedAt: -1 });
    res.status(200).json(posts);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

// UPDATE

export const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const post = await Post.findById(id);
    const user = await User.findById(userId);
    const friend = await User.findById(post.userId);

    const isLiked = post.likes.get(userId);

    if (isLiked) {
      post.likes.delete(userId);
    } else {
      post.likes.set(userId, true);
      let ts = Date.now();
      let date_time = new Date(ts);
      var datetime = `${date_time.getFullYear()}${
        date_time.getMonth() + 1
      }${date_time.getDate()}${date_time.getHours()}${date_time.getMinutes()}${date_time.getSeconds()}`;
      console.log(datetime, "date");
      const obj = {
        userId: user._id,
        userImg: user.picturePath,
        message: `${user.firstName + " " + user.lastName} liked your post`,
        read: false,
        time: datetime,
        post,
      };
      // console.log(obj, "obj");
      // console.log(post.userId != user._id, "check");
      // console.log(friend?.notifications.length > 0 , 'length check')
      const isThere =
        friend?.notifications.length > 0
          ? friend?.notifications?.map((prop) => {
              if (prop.post) {
                if (prop?.userId.equals(obj?.userId)) {
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
      // console.log(isThere)
      // const isThere = [false, false, false];
      const check = isThere.every((val) => {
        // console.log(val, "vaaallll");
        return val === false;
      });
      console.log(check, "true or false");

      if (check) {
        if (post.userId != user._id) {
          // console.log('create new')
          friend.notifications.push(obj);
        }
      } else {
        console.log("old");
        await friend.notifications.map((param) => {
          // console.log(param, "outside if");
          // console.log(param.userId, "outside if");
          // console.log(obj.userId, "outside if");
          // console.log(param.userId.equals(obj.userId), "outside if");
          if (param.post) {
            if (param.userId.equals(obj.userId)) {
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
    await friend.save();
    console.log(friend.notifications, "filtered");

    const updatePost = await Post.findByIdAndUpdate(
      id,
      { likes: post.likes },
      { new: true }
    );

    // console.log(friend.notifications, "frnd");
    res.status(200).json(updatePost);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

//DELETE POST
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const post = await Post.findByIdAndDelete(id);

    // console.log(post, "post");
    // post.save();
    const user = await User.findById(userId);
    const userPost = await Post.find({ userId });
    const posts = await Promise.all(
      user.following.map((id) => Post.find({ userId: id }))
    );
    // console.log(posts,'post')
    // console.log(userPost,'user post')

    const allPosts = [...posts, ...userPost].flat().sort(function (a, b) {
      return b.updatedAt - a.updatedAt;
    });
    // console.log(allPosts)
    res.status(200).json(allPosts);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
