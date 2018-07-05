"use strict";
const path = require("path");

module.exports = function(app) {
  const applicationService = require("../../services/applications");

  app.route("/:formId?/:applicationId?").get(async (req, res, next) => {
    try {
      const { formId, applicationId } = req.params;

      const viewData = {
        formId,
        forms: [],
        applications: [],
        formTitle: null,
        applicationData: null
      };

      if (applicationId) {
        // look up a specific application
        viewData.applicationData = await applicationService.getApplicationsById(
          applicationId
        );

        if (!viewData.applicationData) {
          return next();
        }

        viewData.formTitle = viewData.applicationData.formTitle;
      } else if (formId) {
        // get applications for a given form
        viewData.applications = await applicationService.getApplicationsByForm(
          formId
        );

        if (viewData.applications.length < 1) {
          return next();
        }

        viewData.formTitle = viewData.applications[0].formTitle;
      } else {
        // fetch all forms instead for a list
        viewData.formTitle = "All online forms";
        viewData.forms = await applicationService.getAvailableForms();
      }

      res.render(path.resolve(__dirname, "views/dashboard"), viewData);
    } catch (error) {
      next(error);
    }
  });
};
