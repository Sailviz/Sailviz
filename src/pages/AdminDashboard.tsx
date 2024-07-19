import { useRouter } from 'next/router'
import { ChangeEvent, useEffect, useState, useId, useCallback } from 'react';
import Dashboard from '../components/Dashboard'
import Select from 'react-select';
import ClubTable from '../components/ClubTable';
import BoatTable from '../components/BoatTable';
import * as DB from '../components/apiMethods';
import Papa from 'papaparse';
import UsersTable from '../components/UsersTable';
import RoleTable from '../components/RoleTable';
import { mutate } from 'swr';
import * as Fetcher from '../components/Fetchers';
import { PERMISSIONS } from '../components/helpers/users';



const AdminDashboard = ({ clubId, userId }: { clubId: string, userId: string }) => {
    console.log(PERMISSIONS)
    const router = useRouter()
    const { user, userIsError, userIsValidating } = Fetcher.UseUser()
    const { club, clubIsError, clubIsValidating } = Fetcher.UseClub()

    var [activeSeriesData, setActiveSeriesData] = useState<SeriesDataType>({
        id: "",
        name: "",
        clubId: "",
        settings: {
            numberToCount: 0
        },
        races: [],
        fleetSettings: [] as FleetSettingsType[]
    })

    var [activeResultId, setActiveResultId] = useState("")

    var [nextRace, setNextRace] = useState(undefined)

    const [boatData, setBoatData] = useState<BoatDataType[]>([])

    const [options, setOptions] = useState([{ label: "", value: {} as BoatDataType }])

    const [users, setUsers] = useState<UserDataType[]>([])

    const [activeUser, setActiveUser] = useState<UserDataType>({} as UserDataType)
    const [activeRole, setActiveRole] = useState<RoleDataType>({} as RoleDataType)

    const [roles, setRoles] = useState<RoleDataType[]>([])

    const [seriesData, setSeriesData] = useState<SeriesDataType[]>([])

    const hidePages = () => {
        var settingsPage = document.getElementById('settings')
        settingsPage?.classList.add('hidden')
        var homePage = document.getElementById('home')
        homePage?.classList.add('hidden')
        var seriesPage = document.getElementById('allSeries')
        seriesPage?.classList.add('hidden')
        var racePage = document.getElementById('allRaces')
        racePage?.classList.add('hidden')
        var usersPage = document.getElementById('users')
        usersPage?.classList.add('hidden')
    }

    const showSettings = () => {
        hidePages()
        var settingsPage = document.getElementById('settings')
        settingsPage?.classList.remove('hidden')
    }

    const showHome = () => {
        hidePages()
        var homePage = document.getElementById('home')
        homePage?.classList.remove('hidden')
    }

    const showSeries = async () => {
        hidePages()
        var seriespage = document.getElementById('allSeries')
        seriespage?.classList.remove('hidden')
    }

    const showRaces = () => {
        hidePages()
        var racesPage = document.getElementById('allRaces')
        racesPage?.classList.remove('hidden')
    }

    const showUsers = async () => {
        hidePages()
        var usersPage = document.getElementById('users')
        usersPage?.classList.remove('hidden')

        //fetch users
        var data = await DB.GetUsersByClubId(club.id)
        if (data) {
            setUsers(data)
            console.log(data)
        } else {
            console.log("could not fetch users")
        }

        //fetch roles
        var roles = await DB.GetRolesByClubId(club.id)
        if (roles) {
            setRoles(roles)
            console.log(roles)
        } else {
            console.log("could not fetch roles")
        }
    }

    const createUser = async () => {
        const user = await DB.createUser(club.id)
        if (user) {
            setUsers(users.concat(user))
        } else {
            console.log("could not create user")
        }
    }

    const updateUser = async () => {
        console.log(activeUser)
        await DB.updateUser(activeUser)
        setUsers(await DB.GetUsersByClubId(club.id))
    }

    const deleteUser = async () => {
        console.log(activeUser)
        await DB.deleteUser(activeUser)
        setUsers(await DB.GetUsersByClubId(club.id))
    }
    const createRole = async () => {
        const role = await DB.createRole(club.id)
        if (role) {
            setRoles(roles.concat(role))
        } else {
            console.log("could not create role")
        }
    }
    const updateRole = async () => {
        console.log(activeRole)
        await DB.updateRole(activeRole)
        setRoles(await DB.GetRolesByClubId(club.id))
    }

    const deleteRole = async () => {
        console.log(activeRole)
        await DB.deleteRole(activeRole)
        setRoles(await DB.GetRolesByClubId(club.id))
    }


    const showUserEditModal = async (userId: string) => {
        setActiveUser(users.find(x => x.id == userId) as UserDataType)
        document.getElementById("userEditModal")!.classList.remove("hidden")
    }

    const showRoleEditModal = async (roleId: string) => {
        setActiveRole(roles.find(x => x.id == roleId) as RoleDataType)
        document.getElementById("roleEditModal")!.classList.remove("hidden")
    }


    const saveClubSettings = (e: ChangeEvent<HTMLInputElement>) => {
        const tempdata = club
        // use e.target.id to update the correct field in the club data
        switch (e.target.id) {
            case 'pursuitLength':
                tempdata.settings.pursuitLength = parseInt(e.target.value)
                break
            case 'clockIP':
                tempdata.settings.clockIP = e.target.value
                break
            case 'clockOffset':
                tempdata.settings.clockOffset = parseInt(e.target.value)
                break
            case 'hornIP':
                tempdata.settings.hornIP = e.target.value
                break
        }
    }

    const updateBoat = async (boat: BoatDataType) => {
        const tempdata = boatData
        tempdata[tempdata.findIndex((x: BoatDataType) => x.id === boat.id)] = boat
        setBoatData([...tempdata])
        await DB.updateBoatById(boat)
    }

    const deleteBoat = async (boat: BoatDataType) => {
        const tempdata = boatData
        tempdata.splice(tempdata.findIndex((x: BoatDataType) => x.id === boat.id), 1)
        setBoatData([...tempdata])
        await DB.deleteBoatById(boat.id)
    }

    const createBoat = async () => {
        const tempdata = boatData
        const Boat: BoatDataType = await DB.createBoat("", 0, 0, 0, club.id)
        console.log(Boat)
        if (Boat) {
            setBoatData([Boat, ...tempdata])
        } else {
            alert("something went wrong")
        }
    }

    const createSeries = async () => {
        var newSeries = await DB.createSeries(club.id, "NewSeries")
        newSeries.races = []
        setSeriesData(seriesData.concat(newSeries))
    }




    const updateSeries = async (series: SeriesDataType) => {
        const tempdata = seriesData
        tempdata[tempdata.findIndex((x: SeriesDataType) => x.id === series.id)] = series
        setSeriesData([...tempdata])
        await DB.updateSeries(series)
    }

    const deleteSeries = async (series: SeriesDataType) => {
        console.log("updating main copy of series")
        let newSeriesData: SeriesDataType[] = seriesData
        newSeriesData.splice(newSeriesData.findIndex(y => y.id == series.id), 1)
        console.log(newSeriesData)
        setSeriesData([...newSeriesData])
        await DB.deleteSeries(series)
    }

    const boatFileUploadHandler = async (e: ChangeEvent<HTMLInputElement>) => {
        Papa.parse(e.target.files![0]!, {
            header: true,
            skipEmptyLines: true,
            complete: async function (boats: any) {
                console.log(boats.data)
                for (const boat of boats.data) {
                    //check if all fields are present
                    if (boat.Name == undefined || boat.Crew == undefined || boat.PY == undefined) {
                        alert("missing fields")
                        return
                    }
                    let DBboat = boatData.find(DBboat => DBboat.name == boat.Name)
                    if (DBboat == undefined) {
                        await DB.createBoat(boat.Name, parseInt(boat.Crew), parseInt(boat.PY), parseInt(boat.pursuitStartTime || 0), club.id)
                    } else {
                        //check if uploaded boat is different from existing boat
                        if (DBboat.name == boat.Name && DBboat.crew == parseInt(boat.Crew) && DBboat.py == parseInt(boat.PY) && DBboat.pursuitStartTime == parseInt(boat.pursuitStartTime || 0)) {

                        } else {
                            DB.updateBoatById({ ...DBboat, name: boat.Name, crew: parseInt(boat.Crew), py: parseInt(boat.PY), pursuitStartTime: parseInt(boat.pursuitStartTime || 0) })
                        }
                    }
                }
                await fetchBoats()
                alert("boats updated")
            },
        });
    }

    const downloadBoats = async () => {
        var csvRows: string[] = []
        const headers = ['Name', 'Crew', 'PY', 'PursuitStartTime']

        csvRows.push(headers.join(','));

        boatData.forEach(boat => {
            var values = [boat.name, boat.crew, boat.py, boat.pursuitStartTime]
            //join values with comma
            csvRows.push(values.join(','))
        })
        //join results with new line
        let data = csvRows.join('\n')

        // Creating a Blob for having a csv file format  
        // and passing the data with type 
        const blob = new Blob([data], { type: 'text/csv' });

        // Creating an object for downloading url 
        const url = window.URL.createObjectURL(blob)

        // Creating an anchor(a) tag of HTML 
        const a = document.createElement('a')

        // Passing the blob downloading url  
        a.setAttribute('href', url)

        // Setting the anchor tag attribute for downloading 
        // and passing the download file name 
        a.setAttribute('download', club.name + 'boats.csv');

        // Performing a download with click 
        a.click()
    }

    const fetchBoats = async () => {
        var data = await DB.getBoats(club.id)
        if (data) {
            let array = [...data]
            setBoatData(array)
            let tempoptions: { label: string; value: BoatDataType }[] = []
            array.forEach(boat => {
                tempoptions.push({ value: boat as BoatDataType, label: boat.name })
            })
            setOptions(tempoptions)
        } else {
            console.log("could not find boats")
        }

    }

    const fetchSeries = async () => {
        var data = await DB.GetSeriesByClubId(club.id)
        if (data) {
            setSeriesData(data)
        } else {
            console.log("could not find series")
        }
    }

    useEffect(() => {
        if (club?.id != undefined) {
            fetchBoats()
            fetchSeries()
        }

    }, [club])


    return (
        <Dashboard >
            <div className="w-full flex flex-row items-center justify-start panel-height">
                <div id="leftBar" className='flex basis-3/12 flex-col justify-start h-full border-pink-500 border-r-2 overflow-y-auto'>
                    <div id="settingsbutton" className='w-full flex cursor-pointer' onClick={showSettings}>
                        <div className='w-full p-4 bg-pink-500 text-lg font-extrabold text-gray-700 over'>
                            <p>Settings</p>
                        </div>
                    </div>
                    <div id='homebutton' className='w-full flex cursor-pointer' onClick={showHome}>
                        <div className='w-full p-4 bg-pink-500 text-lg font-extrabold text-gray-700 over'>
                            <p>Home</p>
                        </div>
                    </div>
                    <div id='usersbutton' className='w-full flex cursor-pointer' onClick={showUsers}>
                        <div className='w-full p-4 bg-pink-500 text-lg font-extrabold text-gray-700 over'>
                            <p>Users</p>
                        </div>
                    </div>
                    <div id='seriesbutton' className='w-full flex cursor-pointer' onClick={showSeries}>
                        <div className='w-full p-4 bg-pink-500 text-lg font-extrabold text-gray-700 over'>
                            <p>All Series</p>
                        </div>
                    </div>
                    <div id='racesbutton' className='w-full flex cursor-pointer' onClick={showRaces}>
                        <div className='w-full p-4 bg-pink-500 text-lg font-extrabold text-gray-700 over'>
                            <p>All Races</p>
                        </div>
                    </div>
                </div>
                <div id="page" className='flex basis-9/12 h-full w-full overflow-y-auto'>
                    <div id="home" className="">
                        <p className="text-6xl font-extrabold text-gray-700 p-6">
                            Welcome to SailViz
                        </p>
                        {nextRace != undefined ?
                            <div onClick={() => router.push({ pathname: '/Race', query: { race: "fix this" } })} className="cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-3 md:mr-0"> Go to Next Race NOT IMPLEMENTED </div>
                            :
                            <div />
                        }
                        <div onClick={() => router.push('/SignOn')} className="cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg text-md px-5 py-2.5 text-center mr-3 md:mr-0 font-extrabold tracking-wide"> Open Sign on Sheet </div>
                        <div onClick={() => router.push('/Chromecast')} className="cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg text-md px-5 py-2.5 text-center mr-3 md:mr-0 font-extrabold tracking-wide"> Cast Control </div>

                    </div>
                    <div id="allSeries" className='hidden'>
                        {/* map series to buttons. */}
                        {seriesData.map((series, index) => {
                            return (
                                <div className="m-6" key={JSON.stringify(series.id)}>
                                    <div className="cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg text-md px-5 py-2.5 text-center mr-3 md:mr-0 font-extrabold tracking-wide"
                                        onClick={() => router.push({ pathname: '/Series', query: { series: series.id } })}
                                    >
                                        {series.name}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    <div id="allRaces" className='hidden'>

                    </div>
                    <div id="users" className='hidden'>
                        <div className='p-6'>
                            <UsersTable data={users} key={JSON.stringify(users)} edit={showUserEditModal} />
                            <div className="cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg text-md px-5 py-2.5 text-center mr-3 md:mr-0 font-extrabold tracking-wide"
                                onClick={createUser}
                            >
                                Create User
                            </div>
                        </div>
                        <div className='p-6'>
                            <RoleTable data={roles} key={JSON.stringify(roles)} edit={showRoleEditModal} />
                            <div className="cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg text-md px-5 py-2.5 text-center mr-3 md:mr-0 font-extrabold tracking-wide"
                                onClick={createRole}
                            >
                                Create Role
                            </div>
                        </div>
                    </div>
                    <div id="userEditModal" className={"fixed z-10 left-0 top-0 w-full h-full overflow-auto bg-gray-400 backdrop-blur-sm bg-opacity-20 hidden"}>
                        <div className="mx-40 my-20 px-10 py-5 border w-4/5 bg-gray-300 rounded-sm" >
                            <div className="text-6xl font-extrabold text-gray-700 p-6 float-right cursor-pointer" onClick={() => { document.getElementById("userEditModal")!.classList.add("hidden") }}>&times;</div>
                            <div className="text-6xl font-extrabold text-gray-700 p-6">Edit User</div>
                            <div className="flex w-3/4">
                                <div className='flex flex-col px-6 w-full'>
                                    <p className='hidden' id="EditResultId">

                                    </p>
                                    <p className='text-2xl font-bold text-gray-700'>
                                        Display Name
                                    </p>
                                    <input type="text" id="editHelm" className="h-full text-2xl p-4" value={activeUser.displayName} onChange={(e) => setActiveUser({ ...activeUser, displayName: e.target.value })} />
                                </div>
                                <div className='flex flex-col px-6 w-full'>
                                    <p className='text-2xl font-bold text-gray-700'>
                                        username
                                    </p>

                                    <input type="text" id="editCrew" className="h-full text-2xl p-4" value={activeUser.username} onChange={(e) => setActiveUser({ ...activeUser, username: e.target.value })} />
                                </div>
                                <div className='flex flex-col px-6 w-full'>
                                    <p className='text-2xl font-bold text-gray-700'>
                                        Roles
                                    </p>
                                    <div className="w-full p-2 mx-0 my-2">
                                        <Select
                                            id="editRoles"
                                            className=' w-56 h-full text-3xl'
                                            isMulti={true}
                                            options={roles.map((x: RoleDataType) => { return { value: x, label: x.name } }) as any}
                                            onChange={(e) => setActiveUser({ ...activeUser, roles: e.map((x: any) => x.value) }) as any}
                                            value={activeUser.roles?.map((x: RoleDataType) => { return { value: x, label: x.name } }) as any}
                                        />
                                    </div>
                                </div>
                                <div className='flex flex-col px-6 w-full'>
                                    <p className='text-2xl font-bold text-gray-700'>
                                        Start Page
                                    </p>

                                    <input type="text" id="editStartPage" className="h-full text-2xl p-4" value={activeUser.startPage} onChange={(e) => setActiveUser({ ...activeUser, startPage: e.target.value })} />

                                </div>
                            </div>

                            <div className="flex flex-row justify-end">
                                <div className=" flex justify-end mt-8">
                                    <div className="p-4 mr-2">
                                        <p id="confirmRemove" onClick={() => { deleteUser(); document.getElementById("userEditModal")!.classList.add("hidden") }} className="cursor-pointer text-white bg-red-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-xl text-lg px-12 py-4 text-center mr-3 md:mr-0">
                                            Remove
                                        </p>
                                    </div>
                                </div>
                                <div className=" flex justify-end mt-8">
                                    <div className="p-4 mr-2">
                                        <p id="confirmEdit" onClick={() => { updateUser(); document.getElementById("userEditModal")!.classList.add("hidden") }} className="cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-xl px-12 py-4 text-center mr-3 md:mr-0">
                                            update
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="roleEditModal" className={"fixed z-10 left-0 top-0 w-full h-full overflow-auto bg-gray-400 backdrop-blur-sm bg-opacity-20 hidden"}>
                        <div className="mx-40 my-20 px-10 py-5 border w-4/5 bg-gray-300 rounded-sm" >
                            <div className="text-6xl font-extrabold text-gray-700 p-6 float-right cursor-pointer" onClick={() => { document.getElementById("roleEditModal")!.classList.add("hidden") }}>&times;</div>
                            <div className="text-6xl font-extrabold text-gray-700 p-6">Edit User</div>
                            <div className="flex w-3/4">
                                <div className='flex flex-col px-6 w-full'>
                                    <p className='hidden' id="EditResultId">

                                    </p>
                                    <p className='text-2xl font-bold text-gray-700'>
                                        Name
                                    </p>
                                    <input type="text" id="editHelm" className="h-full text-2xl p-4" value={activeRole.name} onChange={(e) => setActiveRole({ ...activeRole, name: e.target.value })} />
                                </div>
                                <div className='flex flex-col px-6 w-full'>
                                    <p className='text-2xl font-bold text-gray-700'>
                                        Permissions
                                    </p>
                                    <div className="w-full p-2 mx-0 my-2">
                                        <Select
                                            id="editRoles"
                                            className=' w-56 h-full text-3xl'
                                            isMulti={true}
                                            options={PERMISSIONS}
                                            onChange={(e) => setActiveRole({ ...activeRole, permissions: { allowed: e.map((x: any) => x) } })}
                                            value={activeRole.permissions?.allowed?.map((x: PermissionType) => { return PERMISSIONS.find((y: any) => y.value == x.value) })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-row justify-end">
                                <div className=" flex justify-end mt-8">
                                    <div className="p-4 mr-2">
                                        <p id="confirmRemove" onClick={() => { deleteRole(); document.getElementById("roleEditModal")!.classList.add("hidden") }} className="cursor-pointer text-white bg-red-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-xl text-lg px-12 py-4 text-center mr-3 md:mr-0">
                                            Remove
                                        </p>
                                    </div>
                                </div>
                                <div className=" flex justify-end mt-8">
                                    <div className="p-4 mr-2">
                                        <p id="confirmEdit" onClick={() => { updateRole(); document.getElementById("roleEditModal")!.classList.add("hidden") }} className="cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-xl px-12 py-4 text-center mr-3 md:mr-0">
                                            update
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="settings" className="hidden w-full">
                        <p className="text-6xl font-extrabold text-gray-700 p-6">
                            Settings
                        </p>
                        <p className='text-2xl font-bold text-gray-700 p-6'>
                            Series
                        </p>
                        <div className='p-6'>
                            <ClubTable data={seriesData} key={JSON.stringify(seriesData)} deleteSeries={deleteSeries} updateSeries={updateSeries} createSeries={createSeries} />
                        </div>
                        <p className='text-2xl font-bold text-gray-700 p-6'>
                            Boats
                        </p>
                        <div className='p-6'>
                            <div className='flex flex-row p-6 justify-around'>
                                <div className="w-1/2 flex px-4">
                                    <label className="w-full">
                                        <p className=" w-full cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-3 md:mr-0 ">
                                            Import Boats
                                        </p>
                                        <input
                                            type="file"
                                            accept=".csv"
                                            onChange={boatFileUploadHandler}
                                            className="display-none"
                                        />
                                    </label>
                                </div>
                                <p onClick={downloadBoats} className="cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-3 md:mr-0 w-1/2">
                                    Download Boats
                                </p>
                            </div>
                            <BoatTable data={boatData} key={boatData} updateBoat={updateBoat} deleteBoat={deleteBoat} createBoat={createBoat} />
                        </div>
                        <p className='text-2xl font-bold text-gray-700 p-6'>
                            Pursuit Race Length
                        </p>
                        <div className='flex flex-col px-6 w-full '>
                            <input type="text"
                                id='pursuitLength'
                                className="w-1/3 p-2 mx-0 my-2 border-4 rounded focus:border-pink-500 focus:outline-none"
                                defaultValue={club?.settings?.pursuitLength}
                                onChange={saveClubSettings}
                                onBlur={() => DB.UpdateClubById(club)}
                            />
                        </div>
                        <p className='text-2xl font-bold text-gray-700 p-6'>
                            Clock Config
                        </p>
                        <div className='flex flex-row px-6 w-full '>
                            <p className='text-2xl font-bold text-gray-700 my-auto mx-4'>
                                IP Address
                            </p>
                            <input type="text"
                                id='clockIP'
                                className="w-1/3 p-2 mx-0 my-2 border-4 rounded focus:border-pink-500 focus:outline-none"
                                defaultValue={club?.settings?.clockIP}
                                onChange={saveClubSettings}
                                onBlur={() => DB.UpdateClubById(club)}
                            />
                            <p className='text-2xl font-bold text-gray-700 my-auto mx-4'>
                                Offset
                            </p>
                            <input type="text"
                                id='clockOffset'
                                className="w-1/3 p-2 mx-0 my-2 border-4 rounded focus:border-pink-500 focus:outline-none"
                                defaultValue={club?.settings?.clockOffset}
                                onChange={saveClubSettings}
                                onBlur={() => DB.UpdateClubById(club)}
                            />
                        </div>
                        <p className='text-2xl font-bold text-gray-700 p-6'>
                            Horn Config
                        </p>
                        <div className='flex flex-col px-6 w-full '>
                            <p className='text-2xl font-bold text-gray-700'>
                                IP Address
                            </p>
                            <input type="text"
                                id='hornIP'
                                className="w-1/3 p-2 mx-0 my-2 border-4 rounded focus:border-pink-500 focus:outline-none"
                                defaultValue={club?.settings?.hornIP}
                                onChange={saveClubSettings}
                                onBlur={() => DB.UpdateClubById(club)}
                            />
                        </div>
                        <div onClick={() => { throw new Error("custom error") }} className="cursor-pointer text-white bg-blue-600 hover:bg-pink-500 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg text-md px-5 py-2.5 text-center mr-3 md:mr-0 font-extrabold tracking-wide"> make an error </div>

                    </div>
                </div>
            </div>
        </Dashboard>
    )
}

export default AdminDashboard