const MainPage = {
    data() {
        return {
            apiResults: [],
            fetching: false,
            searchInput: 'Monet'
        }
    },
    methods: {
        async fetchArtistData(artist) {
            this.apiResults = []
            const baseUrl = 'https://collectionapi.metmuseum.org/public/collection/v1/'
            const searchUrl = baseUrl + 'search?artistOrCulture=true&q=' + artist
            const objects = []
            const objectInfo = []

            if (this.fetching) {
                return
            }

            this.fetching = true;

            await fetch(searchUrl).then(response => response.json())
                .then(({objectIDs}) => objects.push(...objectIDs))

            if (objects.length === 0) {
                return
            }

            await Promise.allSettled(objects.map(id => 
                fetch(baseUrl + 'objects/' + id).then(response => response.json())
                    .then(info => objectInfo.push(info))
            )).then(() => this.fetching = false)

            this.apiResults = objectInfo.sort((a, b) => {
                // assume negligiable difference of area between elements
                const {
                    'Width': aWidth,
                    'Height': aHeight, 
                    'Diameter': aDiam
                } = a.measurements ? a.measurements[0].elementMeasurements : {}
                
                const {
                    'Width': bWidth, 
                    'Height': bHeight,
                    "Diameter": bDiam
                } = b.measurements ? b.measurements[0].elementMeasurements : {}

                const aArea = aDiam ? Math.pow(aDiam / 2, 2) * Math.PI : (aWidth * aHeight) ?? 0
                const bArea = bDiam ? Math.pow(bDiam / 2, 2) * Math.PI : (bWidth * bHeight) ?? 0

                return bArea - aArea 
            }).slice(0, 10)
        }
    },
    created() {
        this.fetchArtistData(this.searchInput)
    },
    template: `
        <div>
            Hello ESI!
        </div>
        <br/>
        <br/>
        <div>
            <button style="margin-right: 20px;" :disabled="fetching" @click="fetchArtistData(searchInput)">Search Artist: </button>
            <input type="text" v-model="searchInput" :disabled="fetching">     
        </div>
        <br/>
        <br/>
        <div v-for="result in apiResults">
            {{result.title}}
        </div>
    `
}