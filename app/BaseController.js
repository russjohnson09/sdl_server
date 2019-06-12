class BaseController
{


    /**
     *
     * @param opts
     * router
     *
     * @returns {Promise<void>}
     */
    static async create(opts)
    {
        let {router} = opts;


        router.get('/', (req,res) => {
            res.send('ok');
        })
    }




}