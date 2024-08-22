import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Radio, RadioGroup } from '@nextui-org/react';
import { useTheme } from 'next-themes';
import { ChangeEvent, useEffect, useState } from 'react';
import Select from 'react-select';
import * as Fetcher from 'components/Fetchers';

export default function EditUserModal({ isOpen, user, onSubmit, onClose }: { isOpen: boolean, user: UserDataType | undefined, onSubmit: (user: UserDataType) => void, onClose: () => void }) {

    const { club, clubIsError, clubIsValidating } = Fetcher.UseClub()
    const { roles: roleOptions, rolesIsError, rolesIsValidating } = Fetcher.Roles(club)

    const [displayName, setDisplayName] = useState("")
    const [username, setUsername] = useState("")
    const [roles, setRoles] = useState<RoleDataType[]>([])
    const [startPage, setStartPage] = useState("")

    const { theme, setTheme } = useTheme()

    useEffect(() => {
        if (user === undefined) return
        setDisplayName(user.displayName)
        setUsername(user.username)
        setRoles(user.roles)
        setStartPage(user.startPage)
    }, [user])

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                scrollBehavior={'outside'}
                size='5xl'
                backdrop='blur'
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                Edit User
                            </ModalHeader>
                            <ModalBody>
                                <div className="flex w-full">
                                    <div className='flex flex-col px-6 w-full'>
                                        <p className='text-2xl font-bold text-gray-700'>
                                            Display Name
                                        </p>
                                        <Input
                                            type="text"
                                            value={displayName}
                                            onValueChange={setDisplayName}
                                        />
                                    </div>
                                    <div className='flex flex-col px-6 w-full'>
                                        <p className='text-2xl font-bold text-gray-700'>
                                            username
                                        </p>
                                        <Input
                                            type="text"
                                            value={username}
                                            onValueChange={setUsername}
                                        />
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
                                                options={roleOptions.map((x: RoleDataType) => { return { value: x, label: x.name } })}
                                                onChange={(e) => setRoles(e.map((x: any) => x.value))}
                                                value={roles?.map((x: RoleDataType) => { return { value: x, label: x.name } })}
                                            />
                                        </div>
                                    </div>
                                    <div className='flex flex-col px-6 w-full'>
                                        <p className='text-2xl font-bold text-gray-700'>
                                            Start Page
                                        </p>

                                        <Input
                                            type="text"
                                            value={startPage}
                                            onValueChange={setStartPage}
                                        />

                                    </div>
                                </div>


                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Close
                                </Button>
                                <Button color="primary" onPress={() => onSubmit({ ...user!, displayName: displayName, username: username, roles: roles, startPage: startPage })}>
                                    Save
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
};
