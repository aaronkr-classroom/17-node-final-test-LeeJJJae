"use strict";

const Discussion = require("../models/Discussion");
const Comment = require("../models/Comment");

const getDiscussionParams = (body, user) => {
  return {
    title: body.title,
    description: body.description,
    author: user,
    category: body.category,
    tags: body.tags,
  };
};

module.exports = {
  /**
   * =====================================================================
   * C: CREATE / 생성
   * =====================================================================
   */
  new: (req, res) => {
    res.render("discussions/new");
  },

  create: async (req, res, next) => {
    let discussionParams = getDiscussionParams(req.body, req.user._id);
    try {
      let discussion = await Discussion.create(discussionParams);
      req.flash("success", "Discussion created successfully!");
      res.locals.redirect = `/discussions/${discussion._id}`;
      next();
    } catch (error) {
      console.log(`Error saving discussion: ${error.message}`);
      req.flash("error", `Failed to create discussion: ${error.message}`);
      res.locals.redirect = "/discussions/new";
      next();
    }
  },

  redirectView: (req, res, next) => {
    let redirectPath = res.locals.redirect;
    if (redirectPath) res.redirect(redirectPath);
    else next();
  },

  /**
   * =====================================================================
   * R: READ / 조회
   * =====================================================================
   */
  index: async (req, res, next) => {
    try {
      let discussions = await Discussion.find().populate("author");
      res.locals.discussions = discussions;
      next();
    } catch (error) {
      console.log(`Error fetching discussions: ${error.message}`);
      next(error);
    }
  },

  indexView: (req, res) => {
    res.render("discussions/index");
  },

  show: async (req, res, next) => {
    try {
      let discussion = await Discussion.findById(req.params.id)
        .populate("author")
        .populate({
          path: "comments",
          populate: {
            path: "author",
            model: "User"
          }
        });
      res.render("discussions/show", {
        discussion: discussion,
        comments: discussion.comments
      });
    } catch (error) {
      console.log(`Error fetching discussion by ID: ${error.message}`);
      next(error);
    }
  },

  showView: (req, res) => {
    res.render("discussions/show");
  },

  /**
   * =====================================================================
   * U: UPDATE / 수정
   * =====================================================================
   */
  edit: async (req, res, next) => {
    try {
      let discussion = await Discussion.findById(req.params.id);
      res.render("discussions/edit", { discussion: discussion });
    } catch (error) {
      console.log(`Error fetching discussion by ID: ${error.message}`);
      next(error);
    }
  },

  update: async (req, res, next) => {
    let discussionParams = getDiscussionParams(req.body, req.user._id);
    try {
      let discussion = await Discussion.findByIdAndUpdate(req.params.id, {
        $set: discussionParams
      });
      req.flash("success", "Discussion updated successfully!");
      res.locals.redirect = `/discussions/${discussion._id}`;
      next();
    } catch (error) {
      console.log(`Error updating discussion: ${error.message}`);
      req.flash("error", `Failed to update discussion: ${error.message}`);
      res.locals.redirect = `/discussions/${req.params.id}/edit`;
      next();
    }
  },

  /**
   * =====================================================================
   * D: DELETE / 삭제
   * =====================================================================
   */
  delete: async (req, res, next) => {
    try {
      await Discussion.findByIdAndRemove(req.params.id);
      req.flash("success", "Discussion deleted successfully!");
      res.locals.redirect = "/discussions";
      next();
    } catch (error) {
      console.log(`Error deleting discussion: ${error.message}`);
      req.flash("error", `Failed to delete discussion: ${error.message}`);
      res.locals.redirect = "/discussions";
      next();
    }
  }
};
