const defaultsShape = {
  message: 'string'
};

function checkForDefaults(defaults) {
  const errors = Object.keys(defaultsShape).filter(key => !Object.prototype.hasOwnProperty.call(defaults, key));
  if (errors.length > 0) errors.forEach(err => console.error(`Key \`${err}\` of type \`${defaultsShape[err]}\` is missing.`));
}

/**
 * @typedef {Object} Config
 * @prop {string} message
 *
 * Anytime a user merges a pull request, they are reminded to delete their branch.
 * @param {Object} robot
 * @param {Config} defaults
 * @param {String} [configFilename]
 */
module.exports = (robot, defaults = {message: "Uh oh! You closed an issue or pull request that you didn't author. Please leave these open for the original author so that they may get the benefit of completing the learning process on their own. Thanks :v:"}, configFilename = 'reopen-closed-issues.yml') => {
  checkForDefaults(defaults);

  robot.on('issues.closed', checkReopen)

  async function checkReopen (context) {
    const {issue, sender} = context.payload;
    const closer = sender.login;
    const author = issue.user.login;

    let config;
    try {
      const {reopenClosedIssues} = await context.config(configFilename);
      config = Object.assign({}, defaults, reopenClosedIssues);
    } catch (err) {
      config = defaults;
    }

    if( closer != author )
    {
      context.github.issues.createComment(context.repo({
        number: issue.number,
        body: config.message
      }));
      return context.github.issues.edit(context.repo({
        number: issue.number,
        state: "open",
      }));
    }
    else {
      return;
    }

  }

  console.log('Yay, the teacher-bot/reopen-closed-issues plugin was loaded!');
};
