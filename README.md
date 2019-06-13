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
    rejection_reasons
    scheduled_interviews
    scorecards
    sources
    users
    user_roles

If endpoints support it, you can add the paginate option to download additional pages:

    greenhouse download --type applications --paginate true
    greenhouse download --type candidates --paginate true
    greenhouse download --type departments --paginate true
    greenhouse download --type email_templates --paginate true
    greenhouse download --type job_posts --paginate true
    greenhouse download --type job_stages --paginate true
    greenhouse download --type jobs --paginate true
    greenhouse download --type offers --paginate true
    greenhouse download --type offices --paginate true
    greenhouse download --type rejection_reasons --paginate true
    greenhouse download --type scheduled_interviews --paginate true
    greenhouse download --type scorecards --paginate true
    greenhouse download --type sources --paginate true
    greenhouse download --type users --paginate true

If you hit rate limits, you can adjust per_page and page url params:

    greenhouse download --type "applications?page=1&per_page=500" --paginate true

To download attachments for a single feed use the command:

    greenhouse download-attachments --type candidates_1
    greenhouse download-activities --type candidates_1

For a full list of commands use:

    greenhouse --help


## Contact

For more information please contact kmturley
