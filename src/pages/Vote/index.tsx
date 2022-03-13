import React, { useEffect, useState } from "react";
import { Alert } from "react-native";
import loadingAnimation from "../../assets/loadingAnimation.json";
import Input from "../../components/Input";
import ModalCandidates from "../../components/ModalCandidates";
import { getDBConnection, saveVotes } from "../../services/SQLiteConnection";
import { firstElement, getEnumRoleElements, getUriCandidates, isSameRole } from "../../utils/helpers";
import { Candidate, EnumRole } from "../../utils/types";
import { Container, Header, LoadingText, LottieFile, TitleText } from "./styles";

export default function Vote({ navigation }: any) {
    const [index, setIndex] = useState(0);
    const [isLoading, setLoading] = useState(true);
    const [votedList, setVotedList] = useState<Candidate[]>([]);
    const [candidatesList, setCandidatesList] = useState<Candidate[]>([]);
    const enumRoles: EnumRole[] = getEnumRoleElements();

    useEffect(() => {
        let isMounted = true;

        setInterval(() => {
            fetch(getUriCandidates())
                .then(res => {
                    res.json().then(json => isMounted ? setCandidatesList(json.candidates) : false);
                })
                .catch(() => Alert.alert("Erro ao buscar dados dos candidatos!❌"))
                .finally(() => isMounted ? setLoading(false) : false);
        }, 4200);

        return () => {
            isMounted = false;
        }
    }, []);

    async function handleVote(candidateCode: number) {
        const vodtedCandidate = firstElement(candidatesList.filter(candidate => candidate.code == candidateCode));

        if (vodtedCandidate == undefined) {
            Alert.alert("Número de candidato informado inválido!❌");
            return;
        }

        vodtedCandidate.votesNumber = 1;

        if (enumRoles.length == index + 1) {
            votedList.push(vodtedCandidate);
            console.log(votedList);
            

            try {
                const db = await getDBConnection();
                await saveVotes(db, votedList);
            } catch (error) {
                console.error(error);
            }
            navigation.goBack();
        } else {
            votedList.push(vodtedCandidate);
    
            setVotedList(votedList);
            setIndex(index + 1);
        }
    }

    return (
        isLoading ?
            <Container>
                <LottieFile
                    source={loadingAnimation}
                    autoPlay
                    loop
                />
                <LoadingText>
                    Loading...
                </LoadingText>
            </Container>
            :
            <Container>
                <Header />
                <TitleText>
                    Informe o número do seu candidato para {enumRoles[index]}👇
                </TitleText>
                <ModalCandidates candidates={candidatesList.filter(
                    candidate => isSameRole(candidate.role, enumRoles[index])
                )} />
                <Input
                    headerText={"Informe o número do candidato"}
                    handleVote={handleVote}
                />
            </Container>
    );
}