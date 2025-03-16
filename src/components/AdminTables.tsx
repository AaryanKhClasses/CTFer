"use client"

import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/table"
import { DeleteChallenge, EditChallenge, ToggleChallenge } from "./ChallengeActions"
import { Chip } from "@heroui/chip"

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

type ChallengeProps = {
    id: string
    name: string
    points: number
    flag: string
    category: string
    ctfId: string
    enabled: boolean
    description: string
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

export function AdminChallengeTable({ challenges }: { challenges: ChallengeProps[] }) {
    return <Table aria-label="Admin Challenge Table">
        <TableHeader>
            <TableColumn>Challenge</TableColumn>
            <TableColumn>Points</TableColumn>
            <TableColumn>Category</TableColumn>
            <TableColumn>Flag</TableColumn>
            <TableColumn>Actions</TableColumn>
        </TableHeader>
        <TableBody emptyContent={"No challenges found"}>
            {challenges.map(challenge => (
                <TableRow key={challenge.id}>
                    <TableCell className="flex flex-col">{challenge.name.toUpperCase()}</TableCell>
                    <TableCell>{challenge.points}</TableCell>
                    <TableCell>{challenge.category}</TableCell>
                    <TableCell>{challenge.flag}</TableCell>
                    <TableCell className="flex flex-row gap-3">
                        <EditChallenge data={challenge} />
                        <ToggleChallenge id={challenge.id} ctfId={challenge.ctfId} enabled={challenge.enabled} />
                        <DeleteChallenge id={challenge.id} ctfId={challenge.ctfId} />
                    </TableCell>
                </TableRow>
            ))}
        </TableBody>
    </Table>
}