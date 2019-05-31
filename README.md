# greenhouse-data-migration

Data migration tool to automatically download greenhouse.io data:

* Bash
* NodeJS 8.x


## Installation

To install run the command:

    npm install -g git+https://git@github.com/kmturley/greenhouse-data-migration.git

Verify it's been installed by running:

    greenhouse --version

Create a credentials.json file containing your account details in the format:

    {
      "domain": "harvest.greenhouse.io",
      "token": "X",
      "root": "v1"
    }

Now copy the file to the tool directory using:

    cp ./credentials.json /usr/local/lib/node_modules/greenhouse-data-migration

Or if you use nvm:

    cp ./credentials.json /Users/username/.nvm/versions/node/v8.9.4/lib/node_modules/greenhouse-data-migration


## Usage

Download data from the API using:

    greenhouse download --type applications

Types available (use 'all' to download all types in one go):

    applications
    candidates
    close_reasons
    degrees
    demographics/questions
    departments
    eeoc
    email_templates
    job_posts
    job_stages
    jobs
    offers
    offices
    prospect_pools
    rejection_reasons
    scheduled_interviews
    scorecards
    sources
    users
    user_roles


For a full list of commands use:

    greenhouse --help


## Contact

For more information please contact kmturley
