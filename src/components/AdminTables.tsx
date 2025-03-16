"use client"

import { Chip } from "@heroui/chip"
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/table"

type UserProps = {
    id: string
    name: string
    email: string
    type: string
    teamName: string | null
    score: number
}

type TeamProps = {
    id: string
    name: string
    netScore: number
}

export function AdminUserTable({ users }: { users: UserProps[] }) {
    return <Table aria-label="Admin User Table">
        <TableHeader>
            <TableColumn>User</TableColumn>
            <TableColumn>Team</TableColumn>
            <TableColumn>User Score</TableColumn>
            <TableColumn>Role</TableColumn>
        </TableHeader>
        <TableBody emptyContent={"No users found"}>
            {users.map(user => (
                <TableRow key={user.id}>
                    <TableCell className="flex flex-col">
                        <span className="text-[0.9rem] font-bold">{user.name.toUpperCase()}</span>
                        <span className="text-[0.8rem] text-default-500 font-semibold">{user.email}</span>
                    </TableCell>
                    <TableCell>{user.teamName || "No Team"}</TableCell>
                    <TableCell>{user.score}</TableCell>
                    <TableCell>{user.type === 'admin' ? (<Chip color="secondary">Admin</Chip>) : (<Chip color="primary">Participant</Chip>)}</TableCell>
                </TableRow>
            ))}
        </TableBody>
    </Table>
}

export function AdminTeamTable({ teams }: { teams: TeamProps[] }) {
    return <Table aria-label="Admin User Table">
        <TableHeader>
            <TableColumn>Team Name</TableColumn>
            <TableColumn>Total Score</TableColumn>
        </TableHeader>
        <TableBody emptyContent={"No teams found"}>
            {teams.map(team => (
                <TableRow key={team.id}>
                    <TableCell className="flex flex-col">{team.name.toUpperCase()}</TableCell>
                    <TableCell>{team.netScore}</TableCell>
                </TableRow>
            ))}
        </TableBody>
    </Table>
}